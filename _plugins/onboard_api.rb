# frozen_string_literal: true

# =============================================================================
# Onboard API Plugin
# =============================================================================
# Generates JSON API files for the theme editor
# Only runs in development (localhost)
# =============================================================================

require 'json'
require 'fileutils'

module Jekyll
  # Generator to create API JSON files
  class OnboardAPIGenerator < Generator
    safe true
    priority :low

    def generate(site)
      # Skip in production
      return unless Jekyll.env == 'development'

      Jekyll.logger.info 'Onboard API:', 'Generating API files...'

      # Create api directory
      api_dir = File.join(site.dest, 'api')
      FileUtils.mkdir_p(api_dir)

      # Generate config endpoint
      generate_config_endpoint(site, api_dir)

      Jekyll.logger.info 'Onboard API:', 'API files generated successfully'
    end

    private

    def generate_config_endpoint(site, api_dir)
      # Get theme from _config.yml
      theme = site.config['theme'] || default_theme

      # Normalize theme structure (ensure OKLCH format)
      theme = normalize_theme(theme)

      response = {
        success: true,
        theme: theme
      }

      # Write config.json
      File.open(File.join(api_dir, 'config.json'), 'w') do |file|
        file.write(JSON.pretty_generate(response))
      end
    end

    def normalize_theme(theme)
      {
        'brand_primary' => normalize_color(theme['brand_primary']),
        'brand_secondary' => theme['brand_secondary'] ? normalize_color(theme['brand_secondary']) : nil,
        'neutral' => theme['neutral'] || 'slate',
        'mode' => theme['mode'] || 'auto'
      }
    end

    def normalize_color(color)
      # If color is already in OKLCH format, return it
      if color.is_a?(Hash) && color.key?('l')
        return color
      end

      # If color is a string (color name), convert to default OKLCH
      # This is a simplified conversion - in real implementation,
      # you'd map color names to actual OKLCH values
      case color
      when 'blue'
        { 'l' => 60, 'c' => 0.18, 'h' => 262 }
      when 'red'
        { 'l' => 55, 'c' => 0.22, 'h' => 25 }
      when 'green'
        { 'l' => 65, 'c' => 0.15, 'h' => 145 }
      else
        # Default blue
        { 'l' => 60, 'c' => 0.18, 'h' => 262 }
      end
    end

    def default_theme
      {
        'brand_primary' => { 'l' => 60, 'c' => 0.18, 'h' => 262 },
        'brand_secondary' => nil,
        'neutral' => 'slate',
        'mode' => 'auto'
      }
    end
  end

  # Static page for config.json (alternative approach)
  class OnboardConfigPage < Page
    def initialize(site, base, dir)
      @site = site
      @base = base
      @dir = dir
      @name = 'config.json'

      process(@name)

      # Get theme from site config
      theme = site.config['theme'] || {
        'brand_primary' => { 'l' => 60, 'c' => 0.18, 'h' => 262 },
        'brand_secondary' => nil,
        'neutral' => 'slate',
        'mode' => 'auto'
      }

      response = {
        'success' => true,
        'theme' => theme
      }

      self.content = JSON.pretty_generate(response)
      self.data = {
        'layout' => nil,
        'sitemap' => false
      }
    end
  end

  # Hook to generate config page
  Jekyll::Hooks.register :site, :post_read do |site|
    if Jekyll.env == 'development'
      site.pages << OnboardConfigPage.new(site, site.source, 'api')
      Jekyll.logger.info 'Onboard API:', 'Config endpoint registered at /api/config.json'
    end
  end
end

# =============================================================================
# NOTE: Write Operations
# =============================================================================
# This plugin only provides READ access to configuration.
#
# For WRITE operations (saving theme changes), you have two options:
#
# 1. Manual approach:
#    - Export theme as JSON from the editor
#    - Manually update _config.yml
#    - Restart Jekyll server
#
# 2. Advanced approach (requires additional setup):
#    - Run a separate Sinatra/WEBrick server alongside Jekyll
#    - Use that server to handle POST requests
#    - Example in docs/advanced/api-server.rb
#
# For Phase 7 MVP, we're using approach #1 (read-only with manual updates)
# =============================================================================
