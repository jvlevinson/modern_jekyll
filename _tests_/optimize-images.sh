#!/bin/bash
#
# Image Optimization Script
# Modern Jekyll Portfolio - Phase 6: Performance Optimization
#
# This script optimizes portfolio images for web delivery:
# - Converts to WebP format (modern, efficient)
# - Creates responsive sizes (mobile/desktop)
# - Maintains aspect ratios
# - Preserves originals
#
# Requirements:
#   - ImageMagick: sudo apt-get install imagemagick
#   - cwebp: sudo apt-get install webp
#
# Usage:
#   chmod +x _tests_/optimize-images.sh
#   ./_tests_/optimize-images.sh
#

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PORTFOLIO_DIR="img/portfolio"
QUALITY=85  # WebP quality (1-100, 85 is good balance)
MAX_WIDTH=650  # Desktop max width
MOBILE_WIDTH=480  # Mobile max width

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  Image Optimization Script${NC}"
echo -e "${BLUE}  Modern Jekyll - Phase 6${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Check if ImageMagick is installed
if ! command -v convert &> /dev/null; then
    echo -e "${RED}❌ ImageMagick not found${NC}"
    echo -e "${YELLOW}Install: sudo apt-get install imagemagick${NC}"
    exit 1
fi

# Check if cwebp is installed
if ! command -v cwebp &> /dev/null; then
    echo -e "${RED}❌ cwebp not found${NC}"
    echo -e "${YELLOW}Install: sudo apt-get install webp${NC}"
    exit 1
fi

# Check if portfolio directory exists
if [ ! -d "$PORTFOLIO_DIR" ]; then
    echo -e "${RED}❌ Portfolio directory not found: $PORTFOLIO_DIR${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Prerequisites satisfied${NC}"
echo ""

# Count images to process
TOTAL_IMAGES=$(find "$PORTFOLIO_DIR" -type f \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" \) | wc -l)

if [ "$TOTAL_IMAGES" -eq 0 ]; then
    echo -e "${YELLOW}⚠️  No images found in $PORTFOLIO_DIR${NC}"
    exit 0
fi

echo -e "${BLUE}Found $TOTAL_IMAGES image(s) to optimize${NC}"
echo ""

PROCESSED=0
SKIPPED=0
ERRORS=0

# Process each image
for img in "$PORTFOLIO_DIR"/*.{jpg,jpeg,JPG,JPEG,png,PNG}; do
    # Skip if glob didn't match
    [ -e "$img" ] || continue

    filename=$(basename "$img")
    name="${filename%.*}"
    ext="${filename##*.}"

    echo -e "${BLUE}Processing: $filename${NC}"

    # Skip if already has -mobile or .webp suffix
    if [[ "$name" == *"-mobile"* ]] || [[ "$ext" == "webp" ]]; then
        echo -e "${YELLOW}  ↳ Skipped (already optimized)${NC}"
        ((SKIPPED++))
        continue
    fi

    # 1. Optimize original (resize to max width if larger)
    echo -n "  ↳ Optimizing original... "
    if convert "$img" -resize "${MAX_WIDTH}x>" -quality 90 "$PORTFOLIO_DIR/${name}.${ext}" 2>/dev/null; then
        echo -e "${GREEN}✓${NC}"
    else
        echo -e "${RED}✗${NC}"
        ((ERRORS++))
        continue
    fi

    # 2. Create mobile version
    echo -n "  ↳ Creating mobile version... "
    if convert "$img" -resize "${MOBILE_WIDTH}x>" -quality 85 "$PORTFOLIO_DIR/${name}-mobile.${ext}" 2>/dev/null; then
        echo -e "${GREEN}✓${NC}"
    else
        echo -e "${RED}✗${NC}"
        ((ERRORS++))
    fi

    # 3. Create WebP version (desktop)
    echo -n "  ↳ Converting to WebP (desktop)... "
    if cwebp -q "$QUALITY" "$PORTFOLIO_DIR/${name}.${ext}" -o "$PORTFOLIO_DIR/${name}.webp" &>/dev/null; then
        echo -e "${GREEN}✓${NC}"
    else
        echo -e "${RED}✗${NC}"
        ((ERRORS++))
    fi

    # 4. Create WebP version (mobile)
    echo -n "  ↳ Converting to WebP (mobile)... "
    if cwebp -q "$QUALITY" "$PORTFOLIO_DIR/${name}-mobile.${ext}" -o "$PORTFOLIO_DIR/${name}-mobile.webp" &>/dev/null; then
        echo -e "${GREEN}✓${NC}"
    else
        echo -e "${RED}✗${NC}"
        ((ERRORS++))
    fi

    # Get file sizes
    ORIGINAL_SIZE=$(du -h "$img" | cut -f1)
    WEBP_SIZE=$(du -h "$PORTFOLIO_DIR/${name}.webp" | cut -f1 2>/dev/null || echo "N/A")

    echo -e "${BLUE}  ↳ Original: ${ORIGINAL_SIZE} → WebP: ${WEBP_SIZE}${NC}"
    echo ""

    ((PROCESSED++))
done

# Summary
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  Optimization Summary${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}  ✓ Processed: $PROCESSED${NC}"
echo -e "${YELLOW}  ↷ Skipped:   $SKIPPED${NC}"

if [ "$ERRORS" -gt 0 ]; then
    echo -e "${RED}  ✗ Errors:    $ERRORS${NC}"
fi

echo ""
echo -e "${GREEN}✨ Image optimization complete!${NC}"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo -e "  1. Review optimized images in $PORTFOLIO_DIR"
echo -e "  2. Update portfolio.html to use <picture> elements"
echo -e "  3. Test image loading with: bundle exec jekyll serve"
echo -e "  4. Run Lighthouse audit to verify improvements"
echo ""

# Show example HTML
echo -e "${BLUE}Example responsive image markup:${NC}"
echo -e "${YELLOW}"
cat << 'EOF'
<picture>
  <source srcset="{{ item.image | replace: '.jpg', '.webp' }}"
          type="image/webp">
  <source srcset="{{ item.image }}"
          media="(min-width: 768px)">
  <source srcset="{{ item.image | replace: '.jpg', '-mobile.jpg' }}"
          media="(max-width: 767px)">
  <img src="{{ item.image }}"
       alt="{{ item.name | escape }}"
       loading="lazy"
       decoding="async"
       class="portfolio-box__image">
</picture>
EOF
echo -e "${NC}"

exit 0
