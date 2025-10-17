# frozen_string_literal: true

# =============================================================================
# Upload Routes - File Upload Endpoints
# =============================================================================
# Modular route handler for /api/upload
# Handles image uploads with Shrine + libvips processing
# =============================================================================

module API
  class App < Roda
    # =========================================================================
    # Upload Route Block (Modular)
    # =========================================================================

    def upload_routes(r)
      # POST /api/upload - Upload and process image
      r.post do
        # Get uploaded file from request
        uploaded_file = r.params['file']

        unless uploaded_file
          response.status = API::Constants::STATUS_BAD_REQUEST
          return {
            success: false,
            error: 'no_file_provided',
            message: 'No file was uploaded'
          }
        end

        # Extract tempfile from Rack file hash
        file_io = uploaded_file.is_a?(Hash) ? uploaded_file[:tempfile] : uploaded_file

        # Upload with Shrine (validates format, size, dimensions)
        uploader = ImageUploader.new(:store)

        begin
          # Upload file (Shrine validates automatically)
          uploaded = uploader.upload(file_io)

          # Get file path for processing (convert Pathname to String)
          file_path = uploaded.storage.path(uploaded.id).to_s
          file_ext = File.extname(file_path).downcase
          basename = File.basename(file_path, file_ext)
          output_dir = File.dirname(file_path)

          # Process image: Convert to WebP
          webp_path = File.join(output_dir, "#{basename}.webp")
          conversion_result = Services::ImageProcessor.convert_to_webp(
            file_path,
            webp_path
          )

          unless conversion_result[:success]
            response.status = API::Constants::STATUS_SERVER_ERROR
            return {
              success: false,
              error: API::Constants::ERROR_IMAGE_PROCESS,
              message: conversion_result[:message]
            }
          end

          # Generate thumbnails
          thumbnail_result = Services::ImageProcessor.generate_thumbnails(
            webp_path,
            output_dir,
            basename
          )

          # Build response with all file variants
          {
            success: true,
            message: API::Constants::SUCCESS_IMAGE_UPLOADED,
            upload: {
              original: {
                url: uploaded.url,
                size: uploaded.size,
                mime_type: uploaded.mime_type,
                width: conversion_result[:width],
                height: conversion_result[:height]
              },
              webp: {
                url: webp_path.sub(API::Constants::JEKYLL_ROOT, ''),
                size: conversion_result[:webp_size],
                width: conversion_result[:width],
                height: conversion_result[:height],
                compression_ratio: conversion_result[:compression_ratio]
              },
              thumbnails: thumbnail_result[:success] ?
                thumbnail_result[:thumbnails].transform_values { |t|
                  {
                    url: t[:path].sub(API::Constants::JEKYLL_ROOT, ''),
                    width: t[:width],
                    height: t[:height],
                    size: t[:size]
                  }
                } : {}
            }
          }

        rescue Shrine::Error => e
          response.status = API::Constants::STATUS_BAD_REQUEST
          {
            success: false,
            error: 'validation_failed',
            message: e.message
          }
        rescue => e
          response.status = API::Constants::STATUS_SERVER_ERROR
          {
            success: false,
            error: 'upload_failed',
            message: e.message
          }
        end
      end

      # GET /api/upload/metadata - Get image metadata without uploading
      r.get 'metadata' do
        file_path = r.params['path']

        unless file_path
          response.status = API::Constants::STATUS_BAD_REQUEST
          return {
            success: false,
            error: 'no_path_provided',
            message: 'File path parameter is required'
          }
        end

        # Resolve path relative to Jekyll root
        full_path = File.join(API::Constants::JEKYLL_ROOT, file_path)

        unless File.exist?(full_path)
          response.status = API::Constants::STATUS_NOT_FOUND
          return {
            success: false,
            error: 'file_not_found',
            message: "File not found: #{file_path}"
          }
        end

        # Get metadata using ImageProcessor
        result = Services::ImageProcessor.get_metadata(full_path)

        if result[:success]
          {
            success: true,
            metadata: result.except(:success)
          }
        else
          response.status = API::Constants::STATUS_SERVER_ERROR
          result
        end
      end
    end
  end
end

# =============================================================================
# Route Design
# =============================================================================
#
# Upload Flow:
# 1. Receive file via multipart/form-data
# 2. Validate with Shrine (type, size, dimensions)
# 3. Store to permanent location
# 4. Convert to WebP with libvips
# 5. Generate thumbnails (small, medium, large)
# 6. Return URLs for all variants
#
# Security:
# - File type validation (content-based, not extension)
# - Size limits (10MB max)
# - Dimension limits (4K max)
# - Automatic EXIF stripping
#
# Performance:
# - Streaming uploads (memory-efficient)
# - libvips processing (10x faster than ImageMagick)
# - Organized storage (by date: 2025/10/02/)
#
# Response Format:
# {
#   success: true,
#   upload: {
#     original: { url, size, mime_type, width, height },
#     webp: { url, size, width, height, compression_ratio },
#     thumbnails: {
#       small: { url, width, height, size },
#       medium: { url, width, height, size },
#       large: { url, width, height, size }
#     }
#   }
# }
# =============================================================================
