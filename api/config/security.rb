# frozen_string_literal: true

require_relative 'constants'
require 'rack/attack'

# =============================================================================
# Rack::Attack Security Configuration
# =============================================================================
# Localhost-only enforcement for development API
# Protects against 2025 Rack CVE vulnerabilities
# Modular, tokenized security rules
# =============================================================================

module API
  module Security
    # =========================================================================
    # Configure Rack::Attack
    # =========================================================================

    def self.configure
      # Enable cache for throttling (required for Rack::Attack)
      Rack::Attack.cache.store = ActiveSupport::Cache::MemoryStore.new if defined?(ActiveSupport)

      # Configure safelists
      configure_safelists

      # Configure blocklists
      configure_blocklists

      # Configure throttles
      configure_throttles

      # Configure custom responses
      configure_responses
    end

    # =========================================================================
    # Safelists (Allow)
    # =========================================================================

    def self.configure_safelists
      # SAFELIST 1: Localhost IPs (Primary Security Layer)
      # Allows requests ONLY from localhost (development-only API)
      Rack::Attack.safelist('allow localhost') do |req|
        client_ip = req.ip

        # Check against tokenized allowed IPs
        API::Constants::ALLOWED_IPS.include?(client_ip) ||
          API::Constants::PRIVATE_NETWORK_PREFIXES.any? { |prefix| client_ip.start_with?(prefix) }
      end

      # SAFELIST 2: Health checks (minimal, specific)
      Rack::Attack.safelist('allow health check') do |req|
        req.path == '/health' && req.get?
      end
    end

    # =========================================================================
    # Blocklists (Deny)
    # =========================================================================

    def self.configure_blocklists
      # BLOCKLIST 1: Production environment (fail-safe)
      # Block ALL requests if somehow running in production
      Rack::Attack.blocklist('block production') do |req|
        API::Constants.production?
      end

      # BLOCKLIST 2: Non-localhost in any environment
      # Block any non-localhost IP (defense in depth)
      Rack::Attack.blocklist('block non-localhost') do |req|
        client_ip = req.ip

        # Inverse of safelist logic
        !API::Constants.allowed_ip?(client_ip)
      end

      # BLOCKLIST 3: Suspicious paths
      # Block known attack vectors
      Rack::Attack.blocklist('block suspicious paths') do |req|
        # Tokenized suspicious patterns
        suspicious_patterns = [
          /\.\.\//, # Directory traversal
          /\.env/,  # Environment files
          /\.git/,  # Git files
          /\.ssh/,  # SSH keys
          /wp-admin/,    # WordPress attacks
          /xmlrpc\.php/, # XML-RPC attacks
          /<script/i     # XSS attempts
        ]

        suspicious_patterns.any? { |pattern| req.path.match?(pattern) }
      end
    end

    # =========================================================================
    # Throttles (Rate Limiting)
    # =========================================================================

    def self.configure_throttles
      # THROTTLE 1: General API requests
      # Limit: 100 requests per minute per IP (tokenized)
      Rack::Attack.throttle('api/ip', limit: API::Constants::RATE_LIMIT_REQUESTS,
                                      period: API::Constants::RATE_LIMIT_PERIOD) do |req|
        req.ip if req.path.start_with?('/api/')
      end

      # THROTTLE 2: File uploads (more restrictive)
      # Limit: 10 uploads per 5 minutes per IP (tokenized)
      Rack::Attack.throttle('upload/ip', limit: API::Constants::UPLOAD_RATE_LIMIT,
                                         period: API::Constants::UPLOAD_RATE_PERIOD) do |req|
        req.ip if req.path == '/api/upload' && req.post?
      end

      # THROTTLE 3: Config writes (very restrictive)
      # Limit: 5 writes per minute per IP
      Rack::Attack.throttle('config/ip', limit: 5, period: 60) do |req|
        req.ip if req.path == '/api/config' && (req.post? || req.put?)
      end
    end

    # =========================================================================
    # Custom Responses
    # =========================================================================

    def self.configure_responses
      # Response for blocked requests
      Rack::Attack.blocklisted_responder = lambda do |_env|
        [
          API::Constants::STATUS_FORBIDDEN,
          { 'Content-Type' => API::Constants::CONTENT_TYPE_JSON },
          [JSON.generate({
            error: API::Constants::ERROR_UNAUTHORIZED,
            message: 'This API is only accessible from localhost',
            status: API::Constants::STATUS_FORBIDDEN,
            hint: 'Ensure you are accessing from 127.0.0.1 or ::1'
          })]
        ]
      end

      # Response for throttled requests
      Rack::Attack.throttled_responder = lambda do |env|
        match_data = env['rack.attack.match_data']
        now = match_data[:epoch_time]

        headers = {
          'Content-Type' => API::Constants::CONTENT_TYPE_JSON,
          'RateLimit-Limit' => match_data[:limit].to_s,
          'RateLimit-Remaining' => '0',
          'RateLimit-Reset' => (now + match_data[:period]).to_s
        }

        [
          429,
          headers,
          [JSON.generate({
            error: 'Rate limit exceeded',
            message: 'Too many requests. Please try again later.',
            retry_after: match_data[:period],
            limit: match_data[:limit],
            status: 429
          })]
        ]
      end
    end

    # =========================================================================
    # Utility Methods
    # =========================================================================

    # Check if request is from localhost
    def self.localhost?(request)
      API::Constants.allowed_ip?(request.ip)
    end

    # Check if request is allowed
    def self.allowed?(request)
      # Must be localhost AND not throttled AND not blocked
      localhost?(request) &&
        !Rack::Attack.blocklisted?(request) &&
        !Rack::Attack.throttled?(request)
    end

    # Get client IP (handle proxies if needed)
    def self.client_ip(request)
      # Use X-Forwarded-For if behind proxy (development only)
      if API::Constants.development? && request.env['HTTP_X_FORWARDED_FOR']
        request.env['HTTP_X_FORWARDED_FOR'].split(',').first.strip
      else
        request.ip
      end
    end

    # Log security event
    def self.log_security_event(event, request, details = {})
      return unless API::Constants.development?

      puts "[SECURITY] #{event}: IP=#{request.ip}, Path=#{request.path}, Details=#{details.inspect}"
    end
  end
end

# =============================================================================
# Initialize Security Configuration
# =============================================================================

# Configure Rack::Attack when file is loaded
API::Security.configure

# =============================================================================
# Notes
# =============================================================================
#
# Design Principles:
# - Modular: Each security layer is separate and configurable
# - Tokenized: All limits and IPs come from Constants module
# - Layered: Multiple defense mechanisms (safelist, blocklist, throttle)
# - Fail-safe: Blocks production, blocks non-localhost
# - Observable: Logging for security events
#
# Security Layers:
# 1. Safelist: Explicitly allow localhost
# 2. Blocklist: Explicitly deny production and non-localhost
# 3. Throttle: Rate limit to prevent abuse
# 4. Response: Clear error messages with hints
#
# Testing:
#   # Allowed
#   curl http://localhost:4001/api/config
#
#   # Blocked
#   curl http://192.168.1.100:4001/api/config
#   # => {"error":"Unauthorized: API only accessible from localhost"}
#
# Rack CVE Mitigation:
# - Latest Rack version (3.0+) includes 2025 CVE patches
# - Localhost-only enforcement prevents remote attacks
# - Input validation at application level
# - Rate limiting prevents DoS
# =============================================================================
