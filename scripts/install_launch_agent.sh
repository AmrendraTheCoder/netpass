#!/bin/bash

# ──────────────────────────────────────────────
# NetPass — macOS Launch Agent Installer
# Supports: Chrome, Brave, Edge, Firefox, Opera, Arc, Vivaldi
# ──────────────────────────────────────────────

PLIST_NAME="com.netpass.wifi.plist"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SOURCE_PLIST="$SCRIPT_DIR/com.autoconnect.wifi.plist"
DEST_DIR="$HOME/Library/LaunchAgents"
DEST_PLIST="$DEST_DIR/$PLIST_NAME"

echo ""
echo "🔗 NetPass — Browser Auto-Start Installer (macOS)"
echo "=================================================="
echo ""

# Detect installed browsers
declare -a BROWSERS=()
declare -a BROWSER_NAMES=()

if [ -d "/Applications/Google Chrome.app" ]; then
    BROWSERS+=("Google Chrome")
    BROWSER_NAMES+=("Google Chrome")
fi
if [ -d "/Applications/Brave Browser.app" ]; then
    BROWSERS+=("Brave Browser")
    BROWSER_NAMES+=("Brave")
fi
if [ -d "/Applications/Microsoft Edge.app" ]; then
    BROWSERS+=("Microsoft Edge")
    BROWSER_NAMES+=("Microsoft Edge")
fi
if [ -d "/Applications/Firefox.app" ]; then
    BROWSERS+=("Firefox")
    BROWSER_NAMES+=("Firefox")
fi
if [ -d "/Applications/Opera.app" ]; then
    BROWSERS+=("Opera")
    BROWSER_NAMES+=("Opera")
fi
if [ -d "/Applications/Arc.app" ]; then
    BROWSERS+=("Arc")
    BROWSER_NAMES+=("Arc")
fi
if [ -d "/Applications/Vivaldi.app" ]; then
    BROWSERS+=("Vivaldi")
    BROWSER_NAMES+=("Vivaldi")
fi

if [ ${#BROWSERS[@]} -eq 0 ]; then
    echo "❌ No supported browsers found in /Applications."
    echo "   Install Chrome, Brave, Edge, Firefox, Opera, Arc, or Vivaldi first."
    exit 1
fi

echo "Detected browsers:"
for i in "${!BROWSERS[@]}"; do
    echo "  $((i + 1)). ${BROWSER_NAMES[$i]}"
done
echo ""

# Let user pick
read -p "Select browser to auto-start [1-${#BROWSERS[@]}] (default: 1): " choice
choice=${choice:-1}

if ! [[ "$choice" =~ ^[0-9]+$ ]] || [ "$choice" -lt 1 ] || [ "$choice" -gt ${#BROWSERS[@]} ]; then
    echo "❌ Invalid selection."
    exit 1
fi

SELECTED_BROWSER="${BROWSERS[$((choice - 1))]}"
SELECTED_NAME="${BROWSER_NAMES[$((choice - 1))]}"

echo ""
echo "✅ Selected: $SELECTED_NAME"
echo ""

# Create LaunchAgents directory if it doesn't exist
mkdir -p "$DEST_DIR"

# Unload existing agent if present
if [ -f "$DEST_PLIST" ]; then
    echo "🔄 Removing existing Launch Agent..."
    launchctl unload "$DEST_PLIST" 2>/dev/null
fi

# Generate plist dynamically
echo "📋 Creating Launch Agent for $SELECTED_NAME..."
cat > "$DEST_PLIST" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.netpass.wifi</string>

    <key>ProgramArguments</key>
    <array>
        <string>/usr/bin/open</string>
        <string>-a</string>
        <string>${SELECTED_BROWSER}</string>
    </array>

    <!-- Run when user logs in -->
    <key>RunAtLoad</key>
    <true/>

    <!-- Also run every 4 hours (14400 seconds) as a backup -->
    <key>StartInterval</key>
    <integer>14400</integer>

    <!-- Don't keep it running, just fire and done -->
    <key>KeepAlive</key>
    <false/>

    <key>StandardOutPath</key>
    <string>/tmp/netpass-wifi.log</string>
    <key>StandardErrorPath</key>
    <string>/tmp/netpass-wifi.err</string>
</dict>
</plist>
EOF

# Load the Launch Agent
echo "🚀 Loading Launch Agent..."
launchctl load "$DEST_PLIST"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Launch Agent installed successfully!"
    echo ""
    echo "What this does:"
    echo "  • $SELECTED_NAME will auto-start when you log into your Mac"
    echo "  • The NetPass extension will check WiFi every 4 hours"
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
