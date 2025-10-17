#!/bin/bash

# =============================================================================
# libvips Installation Script
# =============================================================================
# Installs libvips (10x faster than ImageMagick)
# Detects OS and uses appropriate package manager
# =============================================================================

set -e  # Exit on error

echo "🔍 Detecting operating system..."

# Detect OS
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    echo "📦 macOS detected - using Homebrew"

    if ! command -v brew &> /dev/null; then
        echo "❌ Homebrew not found. Please install from: https://brew.sh"
        exit 1
    fi

    echo "📥 Installing libvips via Homebrew..."
    brew install vips

elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    echo "🐧 Linux detected"

    if command -v apt-get &> /dev/null; then
        echo "📦 Using apt-get (Debian/Ubuntu)"
        sudo apt-get update
        sudo apt-get install -y libvips libvips-dev libvips-tools
    elif command -v yum &> /dev/null; then
        echo "📦 Using yum (RHEL/CentOS/Fedora)"
        sudo yum install -y vips vips-devel vips-tools
    elif command -v pacman &> /dev/null; then
        echo "📦 Using pacman (Arch)"
        sudo pacman -S libvips
    else
        echo "❌ No supported package manager found (apt-get, yum, or pacman)"
        exit 1
    fi
else
    echo "❌ Unsupported OS: $OSTYPE"
    echo "Please install libvips manually: https://www.libvips.org/install.html"
    exit 1
fi

# Verify installation
echo ""
echo "✅ Verifying libvips installation..."
if vips --version; then
    echo ""
    echo "🎉 libvips installed successfully!"
    echo ""
    echo "Next steps:"
    echo "1. cd api"
    echo "2. bundle install"
    echo "3. cd .."
    echo "4. overmind start (or rackup api/config.ru -p 4001)"
else
    echo "❌ libvips installation failed. Please check errors above."
    exit 1
fi
