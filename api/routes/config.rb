# frozen_string_literal: true

# =============================================================================
# Config Routes - Theme Configuration Endpoints
# =============================================================================
# Modular route handler for /api/config
# Handles theme configuration read/write operations
# =============================================================================

module API
  class App < Roda
    # =========================================================================
    # Config Route Block (Modular)
    # =========================================================================
    # Usage: In main routing tree, call: config_routes(r)
    # =========================================================================

    def config_routes(r)
      # GET /api/config - Read current configuration
      r.get do
        config_data = load_jekyll_config

        {
          success: true,
          theme: config_data['theme'],
          source: Constants::JEKYLL_CONFIG_PATH
        }
      end

      # POST /api/config - Update configuration
      r.post do
        # Parse request body
        params = r.params['theme'] ? r.params : JSON.parse(r.body.read)

        # Validate input using dry-validation
        result = Validators.validate_config(params)

        unless result.success?
          response.status = Constants::STATUS_BAD_REQUEST
          return {
            success: false,
            error: Constants::ERROR_VALIDATION_FAILED,
            errors: result.errors.to_h
          }
        end

        # Write to _config.yml using atomic service
        validated_data = result.to_h
        write_result = Services::ConfigWriter.write_theme(validated_data[:theme])

        if write_result[:success]
          {
            success: true,
            message: Constants::SUCCESS_CONFIG_UPDATED,
            theme: validated_data[:theme]
          }
        else
          response.status = Constants::STATUS_SERVER_ERROR
          {
            success: false,
            error: write_result[:error],
            message: write_result[:message]
          }
        end
      end
    end

  end
end

# Note: load_jekyll_config helper is defined in app.rb and available to all route methods

# =============================================================================
# Route Design
# =============================================================================
#
# Modular Pattern:
# - Extracted from main app.rb
# - Self-contained logic
# - Reuses app helpers (load_jekyll_config)
# - Atomic service calls (ConfigWriter)
#
# Security:
# - Input validation (dry-validation)
# - Type safety (contract enforcement)
# - File locking (in ConfigWriter service)
#
# Error Handling:
# - Validation errors: 400 Bad Request
# - Write errors: 500 Server Error
# - Not found: 404 (from helper)
#
# Response Format:
# {
#   success: true/false,
#   theme: { ... },           // On success
#   error: "error_code",      // On failure
#   errors: { field: [...] }  // Validation errors
# }
# =============================================================================
