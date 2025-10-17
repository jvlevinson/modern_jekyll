# frozen_string_literal: true

# =============================================================================
# Content Validator - Content Section Input Validation
# =============================================================================
# Validates hero, services, and portfolio content updates
# Ensures safe, type-safe content before writing to data files
# =============================================================================

require 'dry-validation'

module API
  module Validators
    # =======================================================================
    # Tokenized Constants
    # =======================================================================

    # Text length limits (prevent abuse)
    TITLE_MAX_LENGTH = 200
    DESCRIPTION_MAX_LENGTH = 1000
    TEXT_MAX_LENGTH = 500

    # Array size limits
    MAX_SERVICES = 20
    MAX_PORTFOLIO_ITEMS = 50

    # =======================================================================
    # Hero Section Validator
    # =======================================================================

    class HeroContract < Dry::Validation::Contract
      params do
        required(:hero).hash do
          required(:title).filled(:string, max_size?: TITLE_MAX_LENGTH)
          required(:subtitle).filled(:string, max_size?: DESCRIPTION_MAX_LENGTH)
          optional(:cta_text).maybe(:string, max_size?: TEXT_MAX_LENGTH)
          optional(:cta_link).maybe(:string, max_size?: TEXT_MAX_LENGTH)
        end
      end

      # Validate CTA link format if present
      rule('hero.cta_link') do
        if key? && value && !value.empty?
          # Allow relative paths or full URLs
          unless value.start_with?('/', 'http://', 'https://', '#')
            key.failure('must be a valid URL or path')
          end
        end
      end
    end

    # =======================================================================
    # Services Section Validator
    # =======================================================================

    class ServicesContract < Dry::Validation::Contract
      params do
        required(:services).hash do
          required(:title).filled(:string, max_size?: TITLE_MAX_LENGTH)
          required(:items).array(:hash, max_size?: MAX_SERVICES) do
            required(:icon).filled(:string)
            required(:title).filled(:string, max_size?: TITLE_MAX_LENGTH)
            required(:description).filled(:string, max_size?: DESCRIPTION_MAX_LENGTH)
          end
        end
      end

      # Validate icon format (Font Awesome classes)
      rule('services.items') do
        if key? && value
          value.each_with_index do |item, index|
            icon = item[:icon]
            next unless icon && !icon.empty?

            # Font Awesome icons should start with 'fa-'
            unless icon.start_with?('fa-')
              key(['services', 'items', index, 'icon']).failure(
                'must be a valid Font Awesome class (e.g., fa-laptop)'
              )
            end
          end
        end
      end
    end

    # =======================================================================
    # Portfolio Section Validator
    # =======================================================================

    class PortfolioContract < Dry::Validation::Contract
      params do
        required(:portfolio).hash do
          required(:title).filled(:string, max_size?: TITLE_MAX_LENGTH)
          required(:items).array(:hash, max_size?: MAX_PORTFOLIO_ITEMS) do
            required(:image).filled(:string)
            required(:title).filled(:string, max_size?: TITLE_MAX_LENGTH)
            required(:category).filled(:string, max_size?: TEXT_MAX_LENGTH)
            optional(:description).maybe(:string, max_size?: DESCRIPTION_MAX_LENGTH)
          end
        end
      end

      # Validate image path format
      rule('portfolio.items') do
        if key? && value
          value.each_with_index do |item, index|
            image = item[:image]
            next unless image && !image.empty?

            # Images should be paths or URLs
            unless image.start_with?('/', 'http://', 'https://', 'img/')
              key(['portfolio', 'items', index, 'image']).failure(
                'must be a valid image path or URL'
              )
            end
          end
        end
      end
    end

    # =======================================================================
    # Factory Methods
    # =======================================================================

    def self.validate_hero(params)
      HeroContract.new.call(params)
    end

    def self.validate_services(params)
      ServicesContract.new.call(params)
    end

    def self.validate_portfolio(params)
      PortfolioContract.new.call(params)
    end
  end
end

# =============================================================================
# Usage Examples
# =============================================================================
#
# Hero validation:
#   result = API::Validators.validate_hero({
#     hero: {
#       title: 'Welcome',
#       subtitle: 'My portfolio',
#       cta_text: 'Learn More',
#       cta_link: '/about'
#     }
#   })
#
# Services validation:
#   result = API::Validators.validate_services({
#     services: {
#       title: 'Services',
#       items: [
#         { icon: 'fa-laptop', title: 'Web', description: 'Web development' }
#       ]
#     }
#   })
#
# Portfolio validation:
#   result = API::Validators.validate_portfolio({
#     portfolio: {
#       title: 'Portfolio',
#       items: [
#         {
#           image: '/img/portfolio/1.jpg',
#           title: 'Project 1',
#           category: 'Web Design',
#           description: 'A cool project'
#         }
#       ]
#     }
#   })
#
# Check results:
#   if result.success?
#     validated_data = result.to_h
#   else
#     errors = result.errors.to_h
#   end
#
# =============================================================================
# Security Features
# =============================================================================
#
# Length Limits:
# - Prevents DoS attacks via large payloads
# - Enforces reasonable content sizes
#
# Type Safety:
# - String/array/hash type enforcement
# - Required vs optional fields
#
# Format Validation:
# - URL/path format checks
# - Icon class format validation
#
# Array Size Limits:
# - Prevents memory exhaustion
# - Enforces reasonable content counts
# =============================================================================
