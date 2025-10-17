# frozen_string_literal: true

# =============================================================================
# Content Routes - Content Management Endpoints
# =============================================================================
# Modular route handlers for /api/content/*
# Handles hero, services, and portfolio CRUD operations
# =============================================================================

module API
  class App < Roda
    # =========================================================================
    # Content Route Blocks (Modular)
    # =========================================================================

    # /api/content/hero
    def hero_routes(r)
      # GET /api/content/hero
      r.get do
        config = load_jekyll_config

        {
          success: true,
          hero: config['hero'] || {}
        }
      end

      # POST /api/content/hero
      r.post do
        # Parse request body
        params = r.params['hero'] ? r.params : JSON.parse(r.body.read)

        # Validate input
        result = Validators.validate_hero(params)

        unless result.success?
          response.status = Constants::STATUS_BAD_REQUEST
          return {
            success: false,
            error: Constants::ERROR_VALIDATION_FAILED,
            errors: result.errors.to_h
          }
        end

        # Write to _config.yml
        validated_data = result.to_h
        write_result = Services::ConfigWriter.write_content('hero', validated_data[:hero])

        if write_result[:success]
          {
            success: true,
            message: 'Hero section updated successfully',
            hero: validated_data[:hero]
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

    # /api/content/services
    def services_routes(r)
      # GET /api/content/services
      r.get do
        config = load_jekyll_config

        {
          success: true,
          services: config['services'] || {}
        }
      end

      # POST /api/content/services
      r.post do
        # Parse request body
        params = r.params['services'] ? r.params : JSON.parse(r.body.read)

        # Validate input
        result = Validators.validate_services(params)

        unless result.success?
          response.status = Constants::STATUS_BAD_REQUEST
          return {
            success: false,
            error: Constants::ERROR_VALIDATION_FAILED,
            errors: result.errors.to_h
          }
        end

        # Write to _config.yml
        validated_data = result.to_h
        write_result = Services::ConfigWriter.write_content('services', validated_data[:services])

        if write_result[:success]
          {
            success: true,
            message: 'Services updated successfully',
            services: validated_data[:services]
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

    # /api/content/portfolio
    def portfolio_routes(r)
      # GET /api/content/portfolio
      r.get do
        config = load_jekyll_config

        {
          success: true,
          portfolio: config['portfolio'] || {}
        }
      end

      # POST /api/content/portfolio
      r.post do
        # Parse request body
        params = r.params['portfolio'] ? r.params : JSON.parse(r.body.read)

        # Validate input
        result = Validators.validate_portfolio(params)

        unless result.success?
          response.status = Constants::STATUS_BAD_REQUEST
          return {
            success: false,
            error: Constants::ERROR_VALIDATION_FAILED,
            errors: result.errors.to_h
          }
        end

        # Write to _config.yml
        validated_data = result.to_h
        write_result = Services::ConfigWriter.write_content('portfolio', validated_data[:portfolio])

        if write_result[:success]
          {
            success: true,
            message: 'Portfolio updated successfully',
            portfolio: validated_data[:portfolio]
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

# =============================================================================
# Route Design
# =============================================================================
#
# Modular Pattern (DRY):
# - Each content type has its own route method
# - Shared validation/write pattern
# - Atomic service calls
#
# Content Types:
# - hero: Hero section (title, subtitle, CTA)
# - services: Services list (icon, title, description)
# - portfolio: Portfolio items (image, title, category)
#
# Validation:
# - Type-specific validators (HeroContract, ServicesContract, etc.)
# - Length limits, format checks
# - Security: prevents malicious input
#
# Error Handling:
# - 400: Validation failures
# - 500: Write failures
# - Clear error messages with details
#
# Response Format:
# {
#   success: true/false,
#   [content_type]: { ... },  // On success
#   error: "error_code",      // On failure
#   errors: { ... }           // Validation details
# }
# =============================================================================
