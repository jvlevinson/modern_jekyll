# frozen_string_literal: true

# =============================================================================
# Config Validator - Theme Configuration Input Validation
# =============================================================================
# Validates theme configuration updates using dry-validation
# Ensures type-safe, validated input before writing to _config.yml
# =============================================================================

require 'dry-validation'

module API
  module Validators
    # Theme configuration validator (OKLCH color space)
    class ConfigContract < Dry::Validation::Contract
      # =======================================================================
      # Tokenized Constants
      # =======================================================================

      # OKLCH lightness range (0-100)
      LIGHTNESS_MIN = 0
      LIGHTNESS_MAX = 100

      # OKLCH chroma range (0-0.4 for accessible colors)
      CHROMA_MIN = 0.0
      CHROMA_MAX = 0.4

      # OKLCH hue range (0-360 degrees)
      HUE_MIN = 0
      HUE_MAX = 360

      # Allowed neutral palettes
      NEUTRAL_PALETTES = %w[slate gray zinc neutral stone].freeze

      # Allowed theme modes
      THEME_MODES = %w[auto light dark].freeze

      # =======================================================================
      # Schema Definition
      # =======================================================================

      params do
        required(:theme).hash do
          # Primary color (required)
          required(:brand_primary).hash do
            required(:l).value(:integer, gteq?: LIGHTNESS_MIN, lteq?: LIGHTNESS_MAX)
            required(:c).value(:float, gteq?: CHROMA_MIN, lteq?: CHROMA_MAX)
            required(:h).value(:integer, gteq?: HUE_MIN, lteq?: HUE_MAX)
          end

          # Secondary color (optional/nullable)
          optional(:brand_secondary).maybe(:hash) do
            required(:l).value(:integer, gteq?: LIGHTNESS_MIN, lteq?: LIGHTNESS_MAX)
            required(:c).value(:float, gteq?: CHROMA_MIN, lteq?: CHROMA_MAX)
            required(:h).value(:integer, gteq?: HUE_MIN, lteq?: HUE_MAX)
          end

          # Neutral palette (required)
          required(:neutral).value(:string, included_in?: NEUTRAL_PALETTES)

          # Theme mode (required)
          required(:mode).value(:string, included_in?: THEME_MODES)
        end
      end

      # =======================================================================
      # Custom Rules (Advanced Validation)
      # =======================================================================

      rule('theme.brand_primary') do
        if key? && value
          # Validate chroma-lightness relationship (accessibility)
          # High chroma + very low/high lightness = poor contrast
          lightness = value[:l]
          chroma = value[:c]

          if (lightness < 20 || lightness > 80) && chroma > 0.3
            key.failure('high chroma with extreme lightness may reduce accessibility')
          end
        end
      end

      rule('theme.brand_secondary') do
        if key? && value && value.is_a?(Hash)
          # Same accessibility check for secondary color
          lightness = value[:l]
          chroma = value[:c]

          if (lightness < 20 || lightness > 80) && chroma > 0.3
            key.failure('high chroma with extreme lightness may reduce accessibility')
          end
        end
      end
    end

    # Factory method for validation
    def self.validate_config(params)
      ConfigContract.new.call(params)
    end
  end
end

# =============================================================================
# Usage Example
# =============================================================================
#
# result = API::Validators.validate_config({
#   theme: {
#     brand_primary: { l: 60, c: 0.18, h: 262 },
#     brand_secondary: { l: 70, c: 0.15, h: 180 },
#     neutral: 'slate',
#     mode: 'auto'
#   }
# })
#
# if result.success?
#   # Valid - proceed with update
#   validated_data = result.to_h
# else
#   # Invalid - return errors
#   errors = result.errors.to_h
#   # => { theme: { brand_primary: { l: ['must be less than or equal to 100'] } } }
# end
#
# =============================================================================
# Validation Features
# =============================================================================
#
# Type Safety:
# - Integer/float type enforcement
# - Range validation (tokenized constants)
# - Enum validation (allowed values)
#
# Accessibility:
# - Chroma-lightness relationship checks
# - Prevents extreme combinations
#
# Null Handling:
# - brand_secondary can be null (disabled)
# - Explicit nullable validation
#
# Error Messages:
# - Automatic messages from dry-validation
# - Custom messages for advanced rules
# =============================================================================
