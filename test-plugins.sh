#!/bin/bash

# Configuration - add plugin names (without the 'plugin-' prefix) you want to test
# If array is empty, all plugins will be tested
PLUGINS_TO_TEST=(
  "atp" "fraxlend" "odos" "sequencer"
)

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Find all plugin directories
PACKAGES_DIR="./packages"
ALL_PLUGINS=()

for dir in "$PACKAGES_DIR"/plugin-*; do
  if [ -d "$dir" ]; then
    plugin_name=${dir#"$PACKAGES_DIR/plugin-"}
    ALL_PLUGINS+=("$plugin_name")
  fi
done

echo -e "${BLUE}🧪 Found ${#ALL_PLUGINS[@]} plugins${NC}"

# Determine which plugins to test
if [ ${#PLUGINS_TO_TEST[@]} -eq 0 ]; then
  PLUGINS_TO_TEST=("${ALL_PLUGINS[@]}")
fi

echo -e "${BLUE}🧪 Will test ${#PLUGINS_TO_TEST[@]} plugins: ${PLUGINS_TO_TEST[*]}${NC}"

# Run tests for each selected plugin
FAILED_PLUGINS=()

for plugin in "${PLUGINS_TO_TEST[@]}"; do
  PLUGIN_PATH="$PACKAGES_DIR/plugin-$plugin"
  
  # Verify this is a valid plugin directory
  if [ ! -d "$PLUGIN_PATH" ]; then
    echo -e "${RED}❌ Plugin directory not found: plugin-$plugin${NC}"
    FAILED_PLUGINS+=("$plugin")
    continue
  fi
  
  # Check if it has node_modules
  if [ ! -d "$PLUGIN_PATH/node_modules" ]; then
    echo -e "${YELLOW}⚠️ Warning: plugin-$plugin doesn't have node_modules. Make sure it's installed.${NC}"
  fi
  
  echo -e "\n${BLUE}📦 Testing plugin-$plugin...${NC}"
  
  # Run vitest for this plugin
  (cd "$PLUGIN_PATH" && npx vitest run)
  
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Tests passed for plugin-$plugin${NC}"
  else
    echo -e "${RED}❌ Tests failed for plugin-$plugin${NC}"
    FAILED_PLUGINS+=("$plugin")
  fi
done

# Summary
echo -e "\n${BLUE}📊 Test Summary:${NC}"
if [ ${#FAILED_PLUGINS[@]} -eq 0 ]; then
  echo -e "${GREEN}✅ All plugin tests passed!${NC}"
  exit 0
else
  echo -e "${RED}❌ ${#FAILED_PLUGINS[@]} plugins failed: ${FAILED_PLUGINS[*]}${NC}"
  exit 1
fi