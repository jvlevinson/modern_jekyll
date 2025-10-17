# frozen_string_literal: true

# =============================================================================
# Test Helper (Modular Setup)
# =============================================================================
# Sets up test environment for API endpoint testing
# Uses Rack::Test for HTTP request simulation
# =============================================================================

require 'minitest/autorun'
require 'minitest/reporters'
require 'rack/test'
require 'json'
require 'tempfile'
require_relative '../app'

# Use spec-style reporter for better output
Minitest::Reporters.use! Minitest::Reporters::SpecReporter.new

# =============================================================================
# Base Test Class
# =============================================================================
class APITest < Minitest::Test
  include Rack::Test::Methods

  # Test app instance
  def app
    API::App
  end

  # Parse JSON response
  def json_response
    JSON.parse(last_response.body, symbolize_names: true)
  end

  # Assert successful response
  def assert_success
    assert last_response.ok?, "Expected success but got #{last_response.status}"
    assert json_response[:success], 'Expected success: true in response'
  end

  # Assert error response
  def assert_error(status = nil)
    refute last_response.ok?, 'Expected error response'
    assert_equal status, last_response.status if status
    refute json_response[:success], 'Expected success: false in response'
  end

  # Create test config backup
  def backup_config
    @config_backup = File.read(API::Constants::CONFIG_FILE)
  end

  # Restore config from backup
  def restore_config
    File.write(API::Constants::CONFIG_FILE, @config_backup) if @config_backup
  end

  # Create test image file
  def create_test_image(filename = 'test.jpg', size = 100)
    file = Tempfile.new([filename, '.jpg'])
    file.write('x' * size) # Simple fake image data
    file.rewind
    Rack::Test::UploadedFile.new(file.path, 'image/jpeg')
  end
end