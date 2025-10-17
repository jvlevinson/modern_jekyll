# frozen_string_literal: true

# =============================================================================
# Upload API Tests
# =============================================================================
# Tests for image upload endpoints
# Validates file processing and WebP conversion
# =============================================================================

require_relative 'test_helper'
require 'fileutils'

class UploadAPITest < APITest
  def setup
    # Create test upload directory
    FileUtils.mkdir_p(API::Constants::UPLOAD_DIR)
    FileUtils.mkdir_p(API::Constants::TEMP_UPLOAD_DIR)
  end

  def teardown
    # Clean up test uploads
    Dir.glob(File.join(API::Constants::UPLOAD_DIR, '**/*')).each do |file|
      File.delete(file) if File.file?(file)
    end
  end

  # ==========================================================================
  # POST /api/upload
  # ==========================================================================

  def test_upload_accepts_valid_image
    file = create_test_image('photo.jpg', 1024)

    post '/api/upload', file: file

    assert_success
    assert_equal 'Image uploaded successfully', json_response[:message]

    upload = json_response[:upload]
    assert upload, 'Expected upload data in response'
    assert upload[:original], 'Expected original image data'
    assert upload[:original][:url], 'Expected URL for original'
  end

  def test_upload_rejects_without_file
    post '/api/upload'

    assert_error(400)
    assert_equal 'no_file_provided', json_response[:error]
  end

  def test_upload_validates_file_type
    # Create non-image file
    file = Tempfile.new(['test', '.txt'])
    file.write('Not an image')
    file.rewind
    uploaded = Rack::Test::UploadedFile.new(file.path, 'text/plain')

    post '/api/upload', file: uploaded

    assert_error(400)
    assert_includes json_response[:message], 'validation'
  ensure
    file.close
    file.unlink
  end

  def test_upload_validates_file_size
    # Create oversized file (>10MB)
    large_file = create_test_image('huge.jpg', 11 * 1024 * 1024)

    post '/api/upload', file: large_file

    assert_error(400)
    assert_includes json_response[:message], 'size'
  end

  def test_upload_generates_webp_version
    skip 'libvips not available' unless system('which vips', out: File::NULL)

    # Use actual small JPEG for testing
    test_image = File.join(API::Constants::JEKYLL_ROOT, 'img', 'header.jpg')
    skip 'Test image not found' unless File.exist?(test_image)

    file = Rack::Test::UploadedFile.new(test_image, 'image/jpeg')

    post '/api/upload', file: file

    assert_success

    upload = json_response[:upload]
    assert upload[:webp], 'Expected WebP version'
    assert upload[:webp][:url], 'Expected WebP URL'
    assert upload[:webp][:compression_ratio], 'Expected compression ratio'

    # Verify WebP file exists
    webp_path = File.join(API::Constants::JEKYLL_ROOT, upload[:webp][:url])
    assert File.exist?(webp_path), 'WebP file should exist'
  end

  def test_upload_generates_thumbnails
    skip 'libvips not available' unless system('which vips', out: File::NULL)

    test_image = File.join(API::Constants::JEKYLL_ROOT, 'img', 'header.jpg')
    skip 'Test image not found' unless File.exist?(test_image)

    file = Rack::Test::UploadedFile.new(test_image, 'image/jpeg')

    post '/api/upload', file: file

    assert_success

    thumbnails = json_response[:upload][:thumbnails]
    assert thumbnails, 'Expected thumbnails'

    # Check each thumbnail size
    [:small, :medium, :large].each do |size|
      assert thumbnails[size], "Expected #{size} thumbnail"
      assert thumbnails[size][:url], "Expected URL for #{size}"
      assert thumbnails[size][:width], "Expected width for #{size}"
      assert thumbnails[size][:height], "Expected height for #{size}"
    end
  end

  def test_upload_organizes_by_date
    file = create_test_image('dated.jpg')

    post '/api/upload', file: file

    assert_success

    url = json_response[:upload][:original][:url]
    date_pattern = Time.now.strftime('%Y/%m/%d')
    assert_includes url, date_pattern, 'URL should include date structure'
  end

  # ==========================================================================
  # File Type Support
  # ==========================================================================

  def test_upload_accepts_png
    file = Tempfile.new(['test', '.png'])
    file.write("\x89PNG\r\n\x1a\n") # PNG header
    file.write('x' * 100)
    file.rewind
    uploaded = Rack::Test::UploadedFile.new(file.path, 'image/png')

    post '/api/upload', file: uploaded

    assert_success
  ensure
    file.close
    file.unlink
  end

  def test_upload_accepts_webp
    file = Tempfile.new(['test', '.webp'])
    file.write("RIFF....WEBP") # WebP header
    file.write('x' * 100)
    file.rewind
    uploaded = Rack::Test::UploadedFile.new(file.path, 'image/webp')

    post '/api/upload', file: uploaded

    assert_success
  ensure
    file.close
    file.unlink
  end

  def test_upload_accepts_gif
    file = Tempfile.new(['test', '.gif'])
    file.write("GIF89a") # GIF header
    file.write('x' * 100)
    file.rewind
    uploaded = Rack::Test::UploadedFile.new(file.path, 'image/gif')

    post '/api/upload', file: uploaded

    assert_success
  ensure
    file.close
    file.unlink
  end

  # ==========================================================================
  # Error Recovery
  # ==========================================================================

  def test_upload_handles_processing_errors
    # Simulate error by passing corrupted data
    file = Tempfile.new(['broken', '.jpg'])
    file.write('not a real image')
    file.rewind
    uploaded = Rack::Test::UploadedFile.new(file.path, 'image/jpeg')

    post '/api/upload', file: uploaded

    # Should handle gracefully (validation or processing error)
    refute last_response.server_error?, 'Should not cause 500 error'
  ensure
    file.close
    file.unlink
  end

  def test_upload_cleans_temp_files
    initial_temp_count = Dir.glob(File.join(API::Constants::TEMP_UPLOAD_DIR, '*')).count

    file = create_test_image
    post '/api/upload', file: file

    # Temp directory should not accumulate files
    final_temp_count = Dir.glob(File.join(API::Constants::TEMP_UPLOAD_DIR, '*')).count
    assert_equal initial_temp_count, final_temp_count, 'Temp files should be cleaned up'
  end
end