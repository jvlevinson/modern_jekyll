# frozen_string_literal: true

# =============================================================================
# Onboard API - Rack Configuration
# =============================================================================
# Entry point for the Roda API server
# Run with: rackup config.ru -p 4001
# Or via Overmind: overmind start
# =============================================================================

# Load environment
ENV['RACK_ENV'] ||= 'development'

# Require dependencies
require 'bundler/setup'
Bundler.require(:default, ENV['RACK_ENV'])

# Load application
require_relative 'app'
require_relative 'config/security'

# =============================================================================
# Middleware Stack (Order matters!)
# =============================================================================

use Rack::Deflater        # Gzip compression
use Rack::Attack          # Security (localhost-only)

# Development-specific middleware
if ENV['RACK_ENV'] == 'development'
  use Rack::Reloader      # Auto-reload on changes (no restart needed)
  use Rack::ShowExceptions # Pretty error pages
end

# CORS middleware
use Rack::Cors do
  allow do
    origins(*API::Constants::CORS_ALLOWED_ORIGINS)
    resource '*',
             headers: :any,
             methods: [:get, :post, :put, :patch, :delete, :options]
  end
end

# Logging middleware
use Rack::CommonLogger if ENV['RACK_ENV'] == 'development'

# =============================================================================
# Run Application
# =============================================================================

run API::App.freeze.app

# =============================================================================
# Notes
# =============================================================================
#
# Middleware Order (Important):
# 1. Rack::Deflater - Compress responses (before security)
# 2. Rack::Attack - Security checks (before app)
# 3. Rack::Reloader - Dev auto-reload (before app)
# 4. Rack::Cors - CORS headers (before app)
# 5. API::App - Main application (last)
#
# Running the Server:
#
#   # Option 1: Direct (rackup)
#   bundle exec rackup config.ru -p 4001
#
#   # Option 2: Puma (production-like)
#   bundle exec puma config.ru -p 4001
#
#   # Option 3: Overmind (recommended)
#   overmind start
#   # (Procfile will handle port configuration)
#
# Testing:
#   curl http://localhost:4001/
#   curl http://localhost:4001/health
#   curl http://localhost:4001/api/docs
#   curl http://localhost:4001/api/config
#
# Security:
#   - Rack::Attack enforces localhost-only access
#   - CORS allows only local Jekyll (port 4000)
#   - Gzip compression for performance
#   - Auto-reload in development (no restarts)
# =============================================================================
