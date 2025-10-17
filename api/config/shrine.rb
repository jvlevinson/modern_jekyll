# frozen_string_literal: true

# =============================================================================
# Shrine Configuration - File Upload Management
# =============================================================================
# Modern file upload toolkit with streaming-first architecture
# Handles temporary and permanent storage for image uploads
# =============================================================================

require 'shrine'
require 'shrine/storage/file_system'

# =============================================================================
# Storage Configuration (Tokenized)
# =============================================================================

# Temporary storage (for uploads in progress)
Shrine.storages[:cache] = Shrine::Storage::FileSystem.new(
  API::Constants::TEMP_UPLOAD_DIR
)

# Permanent storage (for finalized uploads)
Shrine.storages[:store] = Shrine::Storage::FileSystem.new(
  API::Constants::UPLOAD_DIR
)

# =============================================================================
# Shrine Plugins (Modular Features)
# =============================================================================

# Note: Not using activerecord plugin since we don't have a database
Shrine.plugin :cached_attachment_data # Form redisplay
Shrine.plugin :restore_cached_data    # Extract metadata for cached files
Shrine.plugin :rack_file              # Accept Rack uploaded file hash
Shrine.plugin :determine_mime_type    # Determine MIME type from content
Shrine.plugin :validation_helpers     # File validation helpers
Shrine.plugin :pretty_location        # Generate nice upload paths

# =============================================================================
# Uploader Class (Modular, Validated)
# =============================================================================

class ImageUploader < Shrine
  # ===========================================================================
  # Tokenized Validation Constants
  # ===========================================================================

  ALLOWED_TYPES = API::Constants::ALLOWED_IMAGE_FORMATS
  ALLOWED_EXTENSIONS = API::Constants::ALLOWED_IMAGE_EXTENSIONS
  MAX_SIZE = API::Constants::MAX_IMAGE_SIZE
  MAX_WIDTH = API::Constants::MAX_IMAGE_WIDTH
  MAX_HEIGHT = API::Constants::MAX_IMAGE_HEIGHT

  # ===========================================================================
  # File Validation (Type-Safe)
  # ===========================================================================

  Attacher.validate do
    # Validate MIME type
    validate_mime_type ALLOWED_TYPES do |mime_type|
      "must be a valid image format (#{ALLOWED_TYPES.join(', ')})"
    end

    # Validate file extension
    validate_extension ALLOWED_EXTENSIONS do |extension|
      "must have a valid image extension (#{ALLOWED_EXTENSIONS.join(', ')})"
    end

    # Validate file size
    validate_max_size MAX_SIZE do |max|
      "must be smaller than #{max / 1024 / 1024}MB"
    end

    # Note: Dimension validation performed after upload with libvips
    # (store_dimensions plugin removed to avoid fastimage dependency)
  end

  # ===========================================================================
  # Upload Path Generation (Organized by Date)
  # ===========================================================================

  def generate_location(io, record: nil, **context)
    timestamp = Time.now.strftime('%Y/%m/%d')
    filename = super

    "#{timestamp}/#{filename}"
  end
end

# =============================================================================
# Usage Example
# =============================================================================
#
# uploader = ImageUploader.new(:store)
# uploaded_file = uploader.upload(File.open('image.jpg'))
#
# uploaded_file.url       # => "/uploads/store/2025/10/02/abc123.jpg"
# uploaded_file.size      # => 1024000
# uploaded_file.mime_type # => "image/jpeg"
#
# =============================================================================
# Design Principles
# =============================================================================
#
# Modular:
# - Separate cache (temp) and store (permanent) locations
# - Plugin-based feature loading
# - Organized upload paths by date
#
# Validated:
# - Type checking (MIME type + extension)
# - Size limits (tokenized constants)
# - Dimension validation
#
# Streaming:
# - Shrine handles uploads in streaming mode
# - Memory-efficient for large files
# - No full file load into RAM
#
# Secure:
# - Validates file content, not just extension
# - Size limits prevent DoS
# - Organized paths prevent conflicts
# =============================================================================
