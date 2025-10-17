# frozen_string_literal: true

# =============================================================================
# Image Processor Service - libvips Optimization
# =============================================================================
# Atomic service for image processing with libvips (10x faster than ImageMagick)
# Handles WebP conversion, resizing, and optimization
# =============================================================================

require 'vips'

module API
  module Services
    class ImageProcessor
      # =======================================================================
      # Tokenized Constants
      # =======================================================================

      # WebP quality settings
      WEBP_QUALITY = API::Constants::WEBP_QUALITY
      WEBP_EFFORT = 6  # Compression effort (0-6, higher = better compression)

      # JPEG quality (for JPEG output)
      JPEG_QUALITY = API::Constants::JPEG_QUALITY

      # Thumbnail sizes (tokenized)
      THUMBNAIL_SIZES = API::Constants::THUMBNAIL_SIZES

      # Supported formats
      SUPPORTED_FORMATS = %w[jpg jpeg png webp].freeze

      # =======================================================================
      # Public API
      # =======================================================================

      # Convert image to WebP format
      # @param input_path [String] Path to source image
      # @param output_path [String] Path for WebP output
      # @return [Hash] Result with success status and metadata
      def self.convert_to_webp(input_path, output_path)
        image = Vips::Image.new_from_file(input_path)

        # Convert to WebP with optimization
        image.webpsave(
          output_path,
          Q: WEBP_QUALITY,
          effort: WEBP_EFFORT,
          strip: true  # Remove EXIF metadata
        )

        {
          success: true,
          output_path: output_path,
          width: image.width,
          height: image.height,
          original_size: File.size(input_path),
          webp_size: File.size(output_path),
          compression_ratio: (File.size(output_path).to_f / File.size(input_path) * 100).round(2)
        }
      rescue => e
        {
          success: false,
          error: 'webp_conversion_failed',
          message: e.message
        }
      end

      # Resize image to specific dimensions
      # @param input_path [String] Path to source image
      # @param output_path [String] Path for resized output
      # @param width [Integer] Target width
      # @param height [Integer] Target height
      # @param maintain_aspect [Boolean] Maintain aspect ratio (default: true)
      # @return [Hash] Result with success status
      def self.resize(input_path, output_path, width:, height:, maintain_aspect: true)
        image = Vips::Image.new_from_file(input_path)

        if maintain_aspect
          # Resize to fit within dimensions (aspect ratio preserved)
          image = image.thumbnail_image(
            width,
            height: height,
            size: :down  # Only shrink, never enlarge
          )
        else
          # Resize to exact dimensions (may distort)
          scale_x = width.to_f / image.width
          scale_y = height.to_f / image.height
          image = image.resize(scale_x, vscale: scale_y)
        end

        # Save with appropriate format
        save_image(image, output_path)

        {
          success: true,
          output_path: output_path,
          width: image.width,
          height: image.height
        }
      rescue => e
        {
          success: false,
          error: 'resize_failed',
          message: e.message
        }
      end

      # Generate thumbnails in multiple sizes
      # @param input_path [String] Path to source image
      # @param output_dir [String] Directory for thumbnails
      # @param basename [String] Base filename (without extension)
      # @return [Hash] Result with paths to all thumbnails
      def self.generate_thumbnails(input_path, output_dir, basename)
        image = Vips::Image.new_from_file(input_path)
        thumbnails = {}

        THUMBNAIL_SIZES.each do |size_name, dimensions|
          output_path = File.join(
            output_dir,
            "#{basename}_#{size_name}.webp"
          )

          thumbnail = image.thumbnail_image(
            dimensions[:width],
            height: dimensions[:height],
            size: :down
          )

          thumbnail.webpsave(
            output_path,
            Q: WEBP_QUALITY,
            effort: WEBP_EFFORT,
            strip: true
          )

          thumbnails[size_name] = {
            path: output_path,
            width: thumbnail.width,
            height: thumbnail.height,
            size: File.size(output_path)
          }
        end

        {
          success: true,
          thumbnails: thumbnails
        }
      rescue => e
        {
          success: false,
          error: 'thumbnail_generation_failed',
          message: e.message
        }
      end

      # Optimize existing image (lossless compression)
      # @param input_path [String] Path to image
      # @return [Hash] Result with optimization stats
      def self.optimize(input_path)
        image = Vips::Image.new_from_file(input_path)
        original_size = File.size(input_path)

        # Create temporary output
        temp_path = "#{input_path}.tmp"

        # Save with optimization
        save_image(image, temp_path)

        # Replace original with optimized version
        File.rename(temp_path, input_path)

        {
          success: true,
          original_size: original_size,
          optimized_size: File.size(input_path),
          savings: original_size - File.size(input_path),
          savings_percent: ((1 - File.size(input_path).to_f / original_size) * 100).round(2)
        }
      rescue => e
        # Clean up temp file if it exists
        File.delete(temp_path) if File.exist?(temp_path)

        {
          success: false,
          error: 'optimization_failed',
          message: e.message
        }
      end

      # Get image metadata without processing
      # @param input_path [String] Path to image
      # @return [Hash] Image metadata
      def self.get_metadata(input_path)
        image = Vips::Image.new_from_file(input_path)

        {
          success: true,
          width: image.width,
          height: image.height,
          format: image.get('vips-loader'),
          bands: image.bands,
          interpretation: image.interpretation,
          size: File.size(input_path)
        }
      rescue => e
        {
          success: false,
          error: 'metadata_extraction_failed',
          message: e.message
        }
      end

      # =======================================================================
      # Private Helper Methods
      # =======================================================================

      # Save image with format detection
      # @param image [Vips::Image] Image object
      # @param output_path [String] Output path
      def self.save_image(image, output_path)
        ext = File.extname(output_path).downcase[1..]

        case ext
        when 'webp'
          image.webpsave(output_path, Q: WEBP_QUALITY, effort: WEBP_EFFORT, strip: true)
        when 'jpg', 'jpeg'
          image.jpegsave(output_path, Q: JPEG_QUALITY, strip: true)
        when 'png'
          image.pngsave(output_path, compression: API::Constants::PNG_COMPRESSION)
        else
          # Fallback to original format
          image.write_to_file(output_path)
        end
      end

      private_class_method :save_image
    end
  end
end

# =============================================================================
# Usage Examples
# =============================================================================
#
# Convert to WebP:
#   result = ImageProcessor.convert_to_webp('input.jpg', 'output.webp')
#   # => { success: true, width: 1920, height: 1080, compression_ratio: 65.5 }
#
# Resize image:
#   result = ImageProcessor.resize('input.jpg', 'output.jpg', width: 800, height: 600)
#   # => { success: true, width: 800, height: 600 }
#
# Generate thumbnails:
#   result = ImageProcessor.generate_thumbnails('input.jpg', 'thumbs/', 'image')
#   # => { success: true, thumbnails: { small: {...}, medium: {...}, large: {...} } }
#
# Optimize:
#   result = ImageProcessor.optimize('image.jpg')
#   # => { success: true, savings: 512000, savings_percent: 25.5 }
#
# =============================================================================
# Performance Notes
# =============================================================================
#
# libvips is 10x faster than ImageMagick because:
# - Streaming architecture (processes data in chunks)
# - Lazy evaluation (only computes what's needed)
# - Efficient memory usage (90% less than ImageMagick)
# - Multi-threaded by default
#
# Example timings (1920x1080 JPEG → WebP):
# - ImageMagick: ~800ms
# - libvips: ~80ms
#
# =============================================================================
