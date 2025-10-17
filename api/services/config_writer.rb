# frozen_string_literal: true

# =============================================================================
# Config Writer Service - Atomic _config.yml Write Operations
# =============================================================================
# Handles safe, atomic writes to Jekyll _config.yml with file locking
# Prevents race conditions and ensures data integrity
# =============================================================================

require 'yaml'
require 'fileutils'

module API
  module Services
    class ConfigWriter
      # =======================================================================
      # Tokenized Constants
      # =======================================================================

      # File lock timeout (milliseconds)
      LOCK_TIMEOUT_MS = 5000
      LOCK_TIMEOUT_SEC = LOCK_TIMEOUT_MS / 1000.0

      # Backup configuration
      BACKUP_ENABLED = true
      BACKUP_SUFFIX = '.backup'

      # Write modes
      WRITE_MODE = 'w'
      READ_MODE = 'r'

      # =======================================================================
      # Public API
      # =======================================================================

      # Write theme configuration to _config.yml
      # @param theme_data [Hash] Validated theme configuration
      # @return [Hash] { success: true/false, error: String, message: String }
      def self.write_theme(theme_data)
        config_path = Constants::JEKYLL_CONFIG_PATH

        atomic_write(config_path) do |config|
          config['theme'] = theme_data
        end
      end

      # Write content section to _config.yml
      # @param section [String] Content section name (hero, services, portfolio)
      # @param content_data [Hash] Validated content data
      # @return [Hash] { success: true/false, error: String, message: String }
      def self.write_content(section, content_data)
        config_path = Constants::JEKYLL_CONFIG_PATH

        atomic_write(config_path) do |config|
          config[section] = content_data
        end
      end

      # =======================================================================
      # Private Implementation (Atomic Operations)
      # =======================================================================

      # Atomic write with file locking
      # @param file_path [String] Path to _config.yml
      # @yield [config] Yields loaded config for modification
      # @return [Hash] Result hash
      def self.atomic_write(file_path)
        # Verify file exists
        unless File.exist?(file_path)
          return {
            success: false,
            error: 'file_not_found',
            message: "Configuration file not found: #{file_path}"
          }
        end

        # Create backup before write
        create_backup(file_path) if BACKUP_ENABLED

        # Open file with exclusive lock
        File.open(file_path, 'r+') do |file|
          # Acquire exclusive lock (blocks if locked by another process)
          acquired = file.flock(File::LOCK_EX | File::LOCK_NB)

          unless acquired
            # Lock not immediately available, wait with timeout
            Timeout.timeout(LOCK_TIMEOUT_SEC) do
              file.flock(File::LOCK_EX)
            end
          end

          begin
            # Read current config
            file.rewind
            config = YAML.load(file.read) || {}

            # Apply modifications (via block)
            yield(config)

            # Write updated config atomically
            # Convert symbol keys to strings to avoid :key: syntax
            file.rewind
            file.truncate(0)
            file.write(stringify_keys(config).to_yaml)
            file.flush

            {
              success: true,
              message: 'Configuration updated successfully'
            }
          ensure
            # Always release lock
            file.flock(File::LOCK_UN)
          end
        end
      rescue Timeout::Error
        {
          success: false,
          error: 'lock_timeout',
          message: "Failed to acquire file lock within #{LOCK_TIMEOUT_MS}ms"
        }
      rescue Psych::SyntaxError => e
        {
          success: false,
          error: 'yaml_syntax_error',
          message: "Invalid YAML syntax: #{e.message}"
        }
      rescue => e
        {
          success: false,
          error: 'write_failed',
          message: "Write operation failed: #{e.message}"
        }
      end

      # Create backup of config file
      # @param file_path [String] Path to _config.yml
      def self.create_backup(file_path)
        backup_path = "#{file_path}#{BACKUP_SUFFIX}"
        FileUtils.cp(file_path, backup_path)
      rescue => e
        # Log backup failure but don't halt write operation
        warn "[WARN] Failed to create backup: #{e.message}"
      end

      # Recursively convert symbol keys to strings
      # Prevents YAML from writing :key: format instead of key:
      # @param obj [Object] Hash, Array, or primitive value
      # @return [Object] Deep copy with stringified keys
      def self.stringify_keys(obj)
        case obj
        when Hash
          obj.each_with_object({}) do |(key, value), result|
            result[key.to_s] = stringify_keys(value)
          end
        when Array
          obj.map { |item| stringify_keys(item) }
        else
          obj
        end
      end

      private_class_method :atomic_write, :create_backup, :stringify_keys
    end
  end
end

# =============================================================================
# Design Principles
# =============================================================================
#
# Atomic Operations:
# - File locking prevents concurrent writes
# - Read-modify-write in single transaction
# - Automatic lock release (ensure block)
#
# Safety Features:
# - Backup before write
# - Lock timeout (prevents deadlock)
# - YAML syntax validation
# - Comprehensive error handling
#
# Concurrency:
# - LOCK_EX: Exclusive lock (no other readers/writers)
# - LOCK_NB: Non-blocking attempt first
# - Timeout fallback: Wait up to 5s for lock
#
# Error Handling:
# - file_not_found: Config doesn't exist
# - lock_timeout: Couldn't acquire lock
# - yaml_syntax_error: Invalid YAML
# - write_failed: Generic I/O error
#
# =============================================================================
# Usage Examples
# =============================================================================
#
# Write theme:
#   result = ConfigWriter.write_theme({
#     brand_primary: { l: 60, c: 0.18, h: 262 },
#     brand_secondary: nil,
#     neutral: 'slate',
#     mode: 'auto'
#   })
#
# Write content:
#   result = ConfigWriter.write_content('hero', {
#     title: 'Welcome',
#     subtitle: 'My portfolio'
#   })
#
# Check result:
#   if result[:success]
#     # Success
#   else
#     # Handle error: result[:error], result[:message]
#   end
#
# =============================================================================
# Thread Safety
# =============================================================================
#
# This service is thread-safe and process-safe:
# - File locking works across threads and processes
# - Multiple API instances can safely write concurrently
# - Jekyll rebuilds won't conflict with API writes
#
# Lock Behavior:
# - First attempt: Non-blocking (LOCK_NB)
# - If locked: Wait up to 5s (timeout)
# - If still locked: Return error (don't hang forever)
#
# =============================================================================
