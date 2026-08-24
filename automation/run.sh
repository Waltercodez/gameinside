#!/bin/bash
# Gameinside Daily News Agent - macOS runner
# Draait via cron elke 3 uur (07,10,13,16,19,22). Dagcap staat in news-fetcher.js

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Load environment variables
set -a
source "$SCRIPT_DIR/.env"
set +a

# Log file (keeps last 30 days of logs)
LOG_FILE="$SCRIPT_DIR/agent.log"

echo "" >> "$LOG_FILE"
echo "=====================================" >> "$LOG_FILE"
echo "Start: $(date '+%Y-%m-%d %H:%M:%S')" >> "$LOG_FILE"
echo "=====================================" >> "$LOG_FILE"

# Run the agent
node "$SCRIPT_DIR/news-fetcher.js" >> "$LOG_FILE" 2>&1

echo "Einde: $(date '+%Y-%m-%d %H:%M:%S')" >> "$LOG_FILE"

# Keep log file clean — remove entries older than 30 days (max ~500 lines)
tail -2000 "$LOG_FILE" > "$LOG_FILE.tmp" && mv "$LOG_FILE.tmp" "$LOG_FILE"
