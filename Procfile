# =============================================================================
# Procfile - Overmind Process Management
# =============================================================================
# Manages Jekyll and API server concurrently
# Run with: overmind start
# =============================================================================

# Jekyll Static Site (Port 4000)
# - Serves main website
# - LiveReload enabled for development
# - Incremental builds for speed
jekyll: bundle exec jekyll serve --port 4000 --livereload --incremental

# Onboard API Server (Port 4001)
# - Roda API for content management
# - Rack::Attack security (localhost-only)
# - Auto-reload on code changes
api: cd api && bundle exec rackup config.ru -p 4001

# =============================================================================
# Usage
# =============================================================================
#
# Start all processes:
#   overmind start
#
# Start specific process:
#   overmind start jekyll
#   overmind start api
#
# Connect to process (interactive):
#   overmind connect jekyll
#   overmind connect api
#
# Restart process:
#   overmind restart jekyll
#   overmind restart api
#
# Stop all:
#   overmind kill
#
# =============================================================================
# Process Details
# =============================================================================
#
# Jekyll (Port 4000):
#   - Main website: http://localhost:4000/
#   - Dashboard: http://localhost:4000/onboard/
#   - LiveReload: Automatic browser refresh
#   - Incremental: Fast rebuilds
#
# API (Port 4001):
#   - Root: http://localhost:4001/
#   - Health: http://localhost:4001/health
#   - Docs: http://localhost:4001/api/docs
#   - Config: http://localhost:4001/api/config
#
# =============================================================================
# Why Overmind?
# =============================================================================
#
# Advantages over Foreman:
# - Individual process control (restart one without affecting others)
# - tmux integration (interactive debugging)
# - Better output handling (no clipping, preserves colors)
# - Active maintenance (Foreman unmaintained since 2023)
#
# Examples:
#   # Restart only API (keep Jekyll running)
#   overmind restart api
#
#   # Debug API interactively
#   overmind connect api
#   # (Now in API process, can use pry, see logs, etc.)
#
#   # Check Jekyll build output
#   overmind connect jekyll
#
# =============================================================================
# Troubleshooting
# =============================================================================
#
# Port already in use:
#   lsof -ti:4000 | xargs kill -9  # Kill Jekyll
#   lsof -ti:4001 | xargs kill -9  # Kill API
#
# Overmind not found:
#   gem install overmind
#   # or
#   brew install tmux overmind (macOS)
#
# tmux not found:
#   brew install tmux (macOS)
#   apt-get install tmux (Linux)
#
# API not loading gems:
#   cd api && bundle install
#
# =============================================================================
