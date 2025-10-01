#!/bin/bash
# Accessibility audit script using axe-core CLI
# Tests WCAG 2.1 AA compliance

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}Starting accessibility audit...${NC}\n"

# Check if Jekyll server is running
if curl -s http://localhost:4000 > /dev/null; then
  echo -e "${GREEN}✓${NC} Jekyll server is running"
  SERVER_RUNNING=true
else
  echo -e "${YELLOW}!${NC} Jekyll server not running, starting it..."
  SERVER_RUNNING=false

  # Start Jekyll server in background
  bundle exec jekyll serve > /dev/null 2>&1 &
  JEKYLL_PID=$!

  # Wait for server to start
  echo -e "${CYAN}Waiting for Jekyll to start...${NC}"
  for i in {1..30}; do
    if curl -s http://localhost:4000 > /dev/null; then
      echo -e "${GREEN}✓${NC} Server started"
      break
    fi
    sleep 1
  done

  # Check if server started successfully
  if ! curl -s http://localhost:4000 > /dev/null; then
    echo -e "${RED}✗${NC} Failed to start Jekyll server"
    exit 1
  fi
fi

# Run accessibility audit
echo -e "\n${CYAN}Running axe accessibility audit...${NC}\n"

npx axe http://localhost:4000 \
  --save _tests_/a11y-report.json \
  --tags wcag2a,wcag2aa,wcag21a,wcag21aa \
  --exit

AUDIT_RESULT=$?

# Stop Jekyll server if we started it
if [ "$SERVER_RUNNING" = false ]; then
  echo -e "\n${CYAN}Stopping Jekyll server...${NC}"
  kill $JEKYLL_PID 2>/dev/null || true
  wait $JEKYLL_PID 2>/dev/null || true
fi

# Check results
if [ $AUDIT_RESULT -eq 0 ]; then
  echo -e "\n${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${GREEN}✅ Accessibility audit passed!${NC}"
  echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
  echo -e "${CYAN}Report saved to: ${NC}_tests_/a11y-report.json"
  echo -e "${CYAN}WCAG Level: ${NC}AA (2.1)"
  echo -e "${CYAN}Tags tested: ${NC}wcag2a, wcag2aa, wcag21a, wcag21aa\n"
  exit 0
else
  echo -e "\n${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${RED}❌ Accessibility violations found!${NC}"
  echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
  echo -e "${YELLOW}Review the detailed report:${NC} _tests_/a11y-report.json"
  echo -e "${YELLOW}Fix violations and run again:${NC} pnpm run test:a11y\n"

  # Show violation summary if jq is available
  if command -v jq &> /dev/null; then
    echo -e "${CYAN}Violation Summary:${NC}"
    jq -r '.violations[] | "  • \(.id): \(.description) (\(.nodes | length) instances)"' _tests_/a11y-report.json 2>/dev/null || true
    echo ""
  fi

  exit 1
fi
