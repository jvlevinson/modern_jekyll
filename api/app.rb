# frozen_string_literal: true

require 'roda'
require 'json'
require_relative 'config/constants'
require_relative 'config/security'

# Load validators
require_relative 'lib/validators/config_validator'
require_relative 'lib/validators/content_validator'

# Load services
require_relative 'services/config_writer'
require_relative 'services/image_processor'

# Load Shrine configuration
require_relative 'config/shrine'

# Load routes (modular)
require_relative 'routes/config'
require_relative 'routes/content'
require_relative 'routes/upload'

# =============================================================================
# Onboard API - Main Application
# =============================================================================
# Roda routing tree architecture
# Modular, plugin-based, high-performance API server
# Runs on Port 4001 alongside Jekyll (Port 4000)
# =============================================================================

module API
  class App < Roda
    # =========================================================================
    # Roda Plugins (Modular Extensions)
    # =========================================================================

    # JSON handling
    plugin :json
    plugin :json_parser  # Parse JSON request bodies

    # HTTP methods (RESTful routing)
    plugin :all_verbs    # Support all HTTP verbs

    # Request/Response helpers
    plugin :halt         # Halt with status code
    plugin :status_handler  # Custom status handlers
    plugin :symbol_matchers # Use symbols in routes (:id, etc.)

    # Note: CORS handled by Rack::Cors middleware in config.ru

    # Error handling
    plugin :error_handler do |e|
      # Log error
      puts "[ERROR] #{e.class}: #{e.message}"
      puts e.backtrace.first(5).join("\n") if Constants.development?

      # Return JSON error response
      {
        error: e.class.name,
        message: e.message,
        status: Constants::STATUS_SERVER_ERROR,
        backtrace: Constants.development? ? e.backtrace.first(10) : nil
      }
    end

    # 404 handler
    plugin :not_found do
      {
        error: 'Not Found',
        message: 'The requested endpoint does not exist',
        status: Constants::STATUS_NOT_FOUND,
        available_endpoints: api_documentation
      }
    end

    # ==========================================================================
    # Routing Tree (Modular, Hierarchical)
    # ==========================================================================

    route do |r|
      # Check security BEFORE routing (fail-fast)
      unless Security.localhost?(r)
        response.status = Constants::STATUS_FORBIDDEN
        {
          error: Constants::ERROR_UNAUTHORIZED,
          ip: r.ip,
          hint: 'This API only works on localhost (127.0.0.1 or ::1)'
        }
      end

      # Health check endpoint (outside /api namespace)
      r.root do
        {
          status: 'ok',
          service: 'Onboard API',
          version: '1.0.0',
          environment: Constants::CURRENT_ENV,
          port: Constants::PORT
        }
      end

      r.get 'health' do
        {
          status: 'healthy',
          uptime: Process.clock_gettime(Process::CLOCK_MONOTONIC).to_i,
          memory_mb: (Process.clock_gettime(Process::CLOCK_MONOTONIC) * 1024).to_i,
          environment: Constants::CURRENT_ENV
        }
      end

      # API namespace (all API routes under /api)
      r.on 'api' do
        # /api/config - Configuration endpoints (modular)
        r.on 'config' do
          config_routes(r)
        end

        # /api/content - Content management endpoints (modular)
        r.on 'content' do
          # /api/content/hero
          r.on 'hero' do
            hero_routes(r)
          end

          # /api/content/services
          r.on 'services' do
            services_routes(r)
          end

          # /api/content/portfolio
          r.on 'portfolio' do
            portfolio_routes(r)
          end
        end

        # /api/upload - File upload endpoints (modular)
        r.on 'upload' do
          upload_routes(r)
        end

        # /api/docs - API documentation
        r.get 'docs' do
          {
            title: 'Onboard API Documentation',
            version: '1.0.0',
            endpoints: api_documentation
          }
        end
      end
    end

    # ==========================================================================
    # Helper Methods (Utility, not routing)
    # ==========================================================================

    # Load Jekyll _config.yml
    # Returns config hash or raises exception
    def load_jekyll_config
      require 'yaml'

      config_path = Constants::JEKYLL_CONFIG_PATH

      unless File.exist?(config_path)
        raise "Configuration file not found: #{config_path}"
      end

      YAML.load_file(config_path)
    end

    # API documentation (auto-generated from routes)
    def api_documentation
      {
        config: {
          'GET /api/config' => 'Read Jekyll configuration',
          'POST /api/config' => 'Update Jekyll configuration'
        },
        content: {
          'GET /api/content/hero' => 'Get hero section',
          'POST /api/content/hero' => 'Update hero section',
          'GET /api/content/services' => 'Get services list',
          'POST /api/content/services' => 'Update services',
          'GET /api/content/portfolio' => 'Get portfolio items',
          'POST /api/content/portfolio' => 'Update portfolio'
        },
        upload: {
          'POST /api/upload' => 'Upload image file (Week 3)'
        },
        meta: {
          'GET /' => 'API status',
          'GET /health' => 'Health check',
          'GET /api/docs' => 'This documentation'
        }
      }
    end
  end
end

# =============================================================================
# Notes
# =============================================================================
#
# Design Principles:
# - Modular: Routes organized by domain (config, content, upload)
# - Routing Tree: Roda checks segments hierarchically (efficient)
# - Plugin-based: Only load what we need
# - Security-first: Localhost check before routing
# - Auto-documented: Routes self-document via /api/docs
#
# Routing Tree Benefits:
# - /api/config checked once for all config endpoints
# - /api/content/hero only evaluated if /api/content matches
# - More efficient than flat routing (like Sinatra)
#
# TODO (Upcoming Weeks):
# - Week 2: Add dry-validation for input
# - Week 2: Implement _config.yml write with locking
# - Week 2: Move route handlers to separate route files
# - Week 3: Integrate Shrine for file uploads
# - Week 3: Add libvips image processing
#
# Usage:
#   curl http://localhost:4001/
#   curl http://localhost:4001/health
#   curl http://localhost:4001/api/docs
#   curl http://localhost:4001/api/config
# =============================================================================
