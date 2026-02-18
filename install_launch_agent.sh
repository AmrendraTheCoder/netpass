#!/bin/bash

# ──────────────────────────────────────────────
# AutoConnect WiFi - macOS Launch Agent Installer
# ──────────────────────────────────────────────

PLIST_NAME="com.autoconnect.wifi.plist"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SOURCE_PLIST="$SCRIPT_DIR/$PLIST_NAME"
DEST_DIR="$HOME/Library/LaunchAgents"
DEST_PLIST="$DEST_DIR/$PLIST_NAME"

echo ""
echo "🔗 AutoConnect WiFi - Launch Agent Installer"
echo "============================================="
echo ""

# Check if source plist exists
if [ ! -f "$SOURCE_PLIST" ]; then
    echo "❌ Error: $PLIST_NAME not found in $SCRIPT_DIR"
    echo "   Make sure you're running this script from the AutoConnect folder."
    exit 1
fi

# Create LaunchAgents directory if it doesn't exist
mkdir -p "$DEST_DIR"

# Unload existing agent if present
if [ -f "$DEST_PLIST" ]; then
    echo "🔄 Removing existing Launch Agent..."
    launchctl unload "$DEST_PLIST" 2>/dev/null
fi

# Copy plist to LaunchAgents
echo "📋 Copying plist to $DEST_DIR..."
cp "$SOURCE_PLIST" "$DEST_PLIST"

# Load the Launch Agent
echo "🚀 Loading Launch Agent..."
launchctl load "$DEST_PLIST"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Launch Agent installed successfully!"
    echo ""
    echo "What this does:"
    echo "  • Chrome will auto-start when you log into your Mac"
    echo "  • The AutoConnect extension will check WiFi every 4 hours"
    echo "  • If not logged in, it will auto-fill your credentials"
    echo ""
    echo "To uninstall later, run:"
    echo "  launchctl unload ~/Library/LaunchAgents/$PLIST_NAME"
    echo "  rm ~/Library/LaunchAgents/$PLIST_NAME"
    echo ""
else
    echo ""
    echo "❌ Failed to load Launch Agent. Try running:"
    echo "  launchctl load $DEST_PLIST"
    echo ""
fi
