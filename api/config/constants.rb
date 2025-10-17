# frozen_string_literal: true

# =============================================================================
# API Constants
# =============================================================================
# Tokenized, variableized configuration
# All magic numbers and strings defined here (DRY principle)
# =============================================================================

module API
  module Constants
    # ==========================================================================
    # Server Configuration
    # ==========================================================================

    # Port configuration (tokenized)
    PORT = ENV.fetch('API_PORT', 4001).to_i
    HOST = ENV.fetch('API_HOST', '127.0.0.1')

    # Environment
    ENV_DEVELOPMENT = 'development'
    ENV_TEST = 'test'
    ENV_PRODUCTION = 'production'
    CURRENT_ENV = ENV.fetch('RACK_ENV', ENV_DEVELOPMENT)

    # ==========================================================================
    # Security Configuration (variableized)
    # ==========================================================================

    # Localhost IPs (tokenized for security)
    LOCALHOST_IPV4 = '127.0.0.1'
    LOCALHOST_IPV6 = '::1'
    LOCALHOST_NAME = 'localhost'

    ALLOWED_IPS = [
      LOCALHOST_IPV4,
      LOCALHOST_IPV6,
      LOCALHOST_NAME
    ].freeze

    # Private network ranges (for local development)
    PRIVATE_NETWORK_PREFIXES = [
      '192.168.',
      '10.',
      '172.16.',
      '172.17.',
      '172.18.',
      '172.19.',
      '172.20.',
      '172.21.',
      '172.22.',
      '172.23.',
      '172.24.',
      '172.25.',
      '172.26.',
      '172.27.',
      '172.28.',
      '172.29.',
      '172.30.',
      '172.31.'
    ].freeze

    # CORS (tokenized)
    CORS_ALLOWED_ORIGINS = [
      "http://#{LOCALHOST_IPV4}:4000",
      "http://#{LOCALHOST_NAME}:4000",
      "http://#{LOCALHOST_IPV4}:#{PORT}",
      "http://#{LOCALHOST_NAME}:#{PORT}"
    ].freeze

    # ==========================================================================
    # File Paths (variableized, not hardcoded)
    # ==========================================================================

    # Project root (calculated, not hardcoded)
    PROJECT_ROOT = File.expand_path('..', __dir__)  # api/
    JEKYLL_ROOT = File.expand_path('..', PROJECT_ROOT)  # modern_jekyll/

    # Configuration files
    JEKYLL_CONFIG_PATH = File.join(JEKYLL_ROOT, '_config.yml')

    # Upload directories
    UPLOAD_DIR = File.join(JEKYLL_ROOT, 'img', 'uploads')
    TEMP_UPLOAD_DIR = File.join(PROJECT_ROOT, 'tmp', 'uploads')

    # ==========================================================================
    # File Upload Limits (tokenized)
    # ==========================================================================

    # Size limits (in bytes) - tokenized for easy adjustment
    MAX_IMAGE_SIZE = 10 * 1024 * 1024  # 10 MB
    MAX_FILE_SIZE = 20 * 1024 * 1024   # 20 MB

    # Image dimensions (tokenized)
    MAX_IMAGE_WIDTH = 3840   # 4K width
    MAX_IMAGE_HEIGHT = 2160  # 4K height

    # Thumbnail sizes (variableized)
    THUMBNAIL_SIZES = {
      small: { width: 200, height: 200 },
      medium: { width: 800, height: 600 },
      large: { width: 1920, height: 1080 }
    }.freeze

    # ==========================================================================
    # Image Processing (variableized)
    # ==========================================================================

    # Allowed formats (tokenized)
    ALLOWED_IMAGE_FORMATS = %w[
      image/jpeg
      image/jpg
      image/png
      image/webp
      image/svg+xml
    ].freeze

    ALLOWED_IMAGE_EXTENSIONS = %w[
      .jpg
      .jpeg
      .png
      .webp
      .svg
    ].freeze

    # WebP quality (tokenized for optimization)
    WEBP_QUALITY = 85
    JPEG_QUALITY = 90
    PNG_COMPRESSION = 9

    # ==========================================================================
    # Content Validation Limits (tokenized)
    # ==========================================================================

    # Text field limits (variableized)
    MIN_TITLE_LENGTH = 3
    MAX_TITLE_LENGTH = 100

    MIN_DESCRIPTION_LENGTH = 10
    MAX_DESCRIPTION_LENGTH = 500

    MIN_BUTTON_TEXT_LENGTH = 2
    MAX_BUTTON_TEXT_LENGTH = 30

    # Array limits (tokenized)
    MAX_SERVICES_COUNT = 10
    MAX_PORTFOLIO_ITEMS = 20

    # ==========================================================================
    # API Response Formats (tokenized)
    # ==========================================================================

    # Content types
    CONTENT_TYPE_JSON = 'application/json'
    CONTENT_TYPE_MULTIPART = 'multipart/form-data'

    # Response codes (variableized for consistency)
    STATUS_OK = 200
    STATUS_CREATED = 201
    STATUS_BAD_REQUEST = 400
    STATUS_UNAUTHORIZED = 401
    STATUS_FORBIDDEN = 403
    STATUS_NOT_FOUND = 404
    STATUS_UNPROCESSABLE = 422
    STATUS_SERVER_ERROR = 500

    # ==========================================================================
    # Rate Limiting (tokenized)
    # ==========================================================================

    # Rack::Attack limits (variableized)
    RATE_LIMIT_REQUESTS = 100     # requests
    RATE_LIMIT_PERIOD = 60        # seconds

    UPLOAD_RATE_LIMIT = 10        # uploads
    UPLOAD_RATE_PERIOD = 300      # 5 minutes

    # ==========================================================================
    # Cache Keys (tokenized for consistency)
    # ==========================================================================

    CACHE_KEY_CONFIG = 'api:config'
    CACHE_KEY_CONTENT = 'api:content'
    CACHE_TTL = 300  # 5 minutes

    # ==========================================================================
    # Logging (variableized)
    # ==========================================================================

    LOG_LEVEL_DEBUG = 'debug'
    LOG_LEVEL_INFO = 'info'
    LOG_LEVEL_WARN = 'warn'
    LOG_LEVEL_ERROR = 'error'

    DEFAULT_LOG_LEVEL = CURRENT_ENV == ENV_DEVELOPMENT ? LOG_LEVEL_DEBUG : LOG_LEVEL_INFO

    # ==========================================================================
    # Error Messages (tokenized, DRY)
    # ==========================================================================

    ERROR_UNAUTHORIZED = 'Unauthorized: API only accessible from localhost'
    ERROR_INVALID_FORMAT = 'Invalid file format'
    ERROR_FILE_TOO_LARGE = 'File size exceeds maximum allowed'
    ERROR_INVALID_INPUT = 'Invalid input data'
    ERROR_VALIDATION_FAILED = 'Input validation failed'
    ERROR_CONFIG_WRITE = 'Failed to write configuration'
    ERROR_IMAGE_PROCESS = 'Image processing failed'

    # Success messages (tokenized)
    SUCCESS_CONFIG_UPDATED = 'Configuration updated successfully'
    SUCCESS_CONTENT_UPDATED = 'Content updated successfully'
    SUCCESS_IMAGE_UPLOADED = 'Image uploaded successfully'

    # ==========================================================================
    # Helper Methods
    # ==========================================================================

    # Check if IP is allowed
    def self.allowed_ip?(ip)
      return true if ALLOWED_IPS.include?(ip)
      return true if PRIVATE_NETWORK_PREFIXES.any? { |prefix| ip.start_with?(prefix) }
      false
    end

    # Check if in development
    def self.development?
      CURRENT_ENV == ENV_DEVELOPMENT
    end

    # Check if in production
    def self.production?
      CURRENT_ENV == ENV_PRODUCTION
    end

    # Get full upload path
    def self.upload_path(filename)
      File.join(UPLOAD_DIR, filename)
    end

    # Get temp upload path
    def self.temp_upload_path(filename)
      File.join(TEMP_UPLOAD_DIR, filename)
    end
  end
end

# =============================================================================
# Notes
# =============================================================================
#
# Design Principles:
# - All constants tokenized (no magic numbers)
# - All paths variableized (calculated, not hardcoded)
# - All limits configurable via constants
# - All error messages DRY (defined once)
# - All helper methods for common operations
#
# Usage:
#   API::Constants::PORT           # => 4001
#   API::Constants.allowed_ip?(ip) # => true/false
#   API::Constants.upload_path('image.jpg')
#
# Benefits:
# - Single source of truth
# - Easy to maintain and update
# - No hardcoded values throughout codebase
# - Type-safe (constants, not strings)
# =============================================================================
