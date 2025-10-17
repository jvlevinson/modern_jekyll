# frozen_string_literal: true

# =============================================================================
# Config API Tests
# =============================================================================
# Tests for theme configuration endpoints
# Validates CRUD operations and file locking
# =============================================================================

require_relative 'test_helper'

class ConfigAPITest < APITest
  def setup
    backup_config
  end

  def teardown
    restore_config
  end

  # ==========================================================================
  # GET /api/config
  # ==========================================================================

  def test_get_config_returns_theme
    get '/api/config'

    assert_success
    assert last_response.content_type.include?('application/json')

    theme = json_response[:theme]
    assert theme, 'Expected theme in response'
    assert theme[:brand_primary], 'Expected brand_primary'
    assert theme[:neutral], 'Expected neutral'
    assert theme[:mode], 'Expected mode'
  end

  def test_get_config_validates_theme_structure
    get '/api/config'

    theme = json_response[:theme]

    # Validate brand_primary OKLCH structure
    assert_kind_of Hash, theme[:brand_primary]
    assert_includes theme[:brand_primary].keys, :l
    assert_includes theme[:brand_primary].keys, :c
    assert_includes theme[:brand_primary].keys, :h

    # Validate types
    assert_kind_of Numeric, theme[:brand_primary][:l]
    assert_kind_of Numeric, theme[:brand_primary][:c]
    assert_kind_of Numeric, theme[:brand_primary][:h]

    # Validate ranges
    assert_in_delta theme[:brand_primary][:l], 50, 50 # 0-100
    assert_in_delta theme[:brand_primary][:c], 0.2, 0.4 # 0-0.4
    assert_in_delta theme[:brand_primary][:h], 180, 180 # 0-360
  end

  # ==========================================================================
  # PUT /api/config
  # ==========================================================================

  def test_update_config_modifies_theme
    original = JSON.parse(File.read(API::Constants::CONFIG_FILE))

    new_theme = {
      brand_primary: { l: 70, c: 0.25, h: 300 },
      brand_secondary: { l: 65, c: 0.2, h: 200 },
      neutral: 'slate',
      mode: 'dark'
    }

    put '/api/config', { theme: new_theme }.to_json, 'CONTENT_TYPE' => 'application/json'

    assert_success
    assert_equal 'Theme configuration updated', json_response[:message]

    # Verify file was updated
    updated = JSON.parse(File.read(API::Constants::CONFIG_FILE))
    assert_equal 70, updated['theme']['brand_primary']['l']
    assert_equal 'dark', updated['theme']['mode']
  end

  def test_update_config_validates_input
    put '/api/config', { theme: { invalid: 'data' } }.to_json, 'CONTENT_TYPE' => 'application/json'

    assert_error(400)
    assert json_response[:errors], 'Expected validation errors'
  end

  def test_update_config_requires_theme
    put '/api/config', {}.to_json, 'CONTENT_TYPE' => 'application/json'

    assert_error(400)
    assert_equal 'theme_missing', json_response[:error]
  end

  def test_update_config_validates_oklch_ranges
    invalid_theme = {
      brand_primary: { l: 150, c: 0.25, h: 300 }, # l > 100
      neutral: 'slate',
      mode: 'light'
    }

    put '/api/config', { theme: invalid_theme }.to_json, 'CONTENT_TYPE' => 'application/json'

    assert_error(400)
    assert json_response[:errors], 'Expected validation errors'
  end

  # ==========================================================================
  # POST /api/config/reset
  # ==========================================================================

  def test_reset_config_restores_defaults
    # Modify config first
    new_theme = {
      brand_primary: { l: 99, c: 0.39, h: 359 },
      neutral: 'zinc',
      mode: 'dark'
    }

    put '/api/config', { theme: new_theme }.to_json, 'CONTENT_TYPE' => 'application/json'
    assert_success

    # Reset to defaults
    post '/api/config/reset'

    assert_success
    assert_equal 'Configuration reset to defaults', json_response[:message]

    # Verify defaults restored
    theme = json_response[:theme]
    assert_equal 60, theme[:brand_primary][:l]
    assert_equal 0.18, theme[:brand_primary][:c]
    assert_equal 262, theme[:brand_primary][:h]
    assert_equal 'stone', theme[:neutral]
    assert_equal 'light', theme[:mode]
  end

  # ==========================================================================
  # Error Handling
  # ==========================================================================

  def test_handles_malformed_json
    put '/api/config', 'not valid json', 'CONTENT_TYPE' => 'application/json'

    assert_error(400)
    assert_includes json_response[:error], 'JSON'
  end

  def test_handles_missing_config_file
    # Temporarily rename config file
    temp_path = API::Constants::CONFIG_FILE + '.bak'
    File.rename(API::Constants::CONFIG_FILE, temp_path)

    get '/api/config'

    assert_error(404)
    assert_equal 'config_not_found', json_response[:error]
  ensure
    File.rename(temp_path, API::Constants::CONFIG_FILE) if File.exist?(temp_path)
  end

  # ==========================================================================
  # File Locking
  # ==========================================================================

  def test_atomic_write_prevents_corruption
    threads = []
    results = []

    # Try concurrent writes
    5.times do |i|
      threads << Thread.new do
        theme = {
          brand_primary: { l: 60 + i, c: 0.18, h: 262 },
          neutral: 'stone',
          mode: 'light'
        }

        response = put '/api/config', { theme: theme }.to_json, 'CONTENT_TYPE' => 'application/json'
        results << response.status
      end
    end

    threads.each(&:join)

    # All should succeed (file locking serializes writes)
    assert results.all? { |status| status == 200 }, 'Expected all writes to succeed'

    # Config should be valid (not corrupted)
    config = JSON.parse(File.read(API::Constants::CONFIG_FILE))
    assert config['theme'], 'Config should still be valid after concurrent writes'
  end
end