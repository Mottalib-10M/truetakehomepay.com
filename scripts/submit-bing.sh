#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────────
#  Submit URLs to Bing via IndexNow API
#  Usage:  ./scripts/submit-bing.sh
#  Requires: BING_API_KEY in scripts/.env
# ──────────────────────────────────────────────────────────────────
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="$SCRIPT_DIR/.env"

if [ ! -f "$ENV_FILE" ]; then
  echo "ERROR: $ENV_FILE not found. Create it with BING_API_KEY=your_key"
  exit 1
fi

# shellcheck source=/dev/null
source "$ENV_FILE"

if [ -z "${BING_API_KEY:-}" ]; then
  echo "ERROR: BING_API_KEY is not set in $ENV_FILE"
  exit 1
fi

HOST="truetakehomepay.com"
KEY="$BING_API_KEY"
KEY_LOCATION="https://${HOST}/${KEY}.txt"

# Collect URLs from the dist/ sitemap or define manually
DIST_DIR="$SCRIPT_DIR/../dist"
URLS=()

if [ -f "$DIST_DIR/sitemap-0.xml" ]; then
  echo "Reading URLs from sitemap..."
  while IFS= read -r url; do
    URLS+=("$url")
  done < <(grep -oP '(?<=<loc>)[^<]+' "$DIST_DIR/sitemap-0.xml")
else
  echo "No sitemap found in dist/. Using core URLs..."
  URLS=(
    "https://${HOST}/"
    "https://${HOST}/salary-calculator/"
    "https://${HOST}/income-tax-calculator/"
    "https://${HOST}/401k-calculator/"
    "https://${HOST}/self-employment-tax-calculator/"
    "https://${HOST}/bonus-tax-calculator/"
    "https://${HOST}/mortgage-calculator/"
    "https://${HOST}/guides/"
    "https://${HOST}/glossary/"
    "https://${HOST}/about/"
  )
fi

echo "Submitting ${#URLS[@]} URLs to Bing IndexNow..."

# Build JSON payload
URL_JSON=$(printf '"%s",' "${URLS[@]}")
URL_JSON="[${URL_JSON%,}]"

PAYLOAD=$(cat <<ENDJSON
{
  "host": "${HOST}",
  "key": "${KEY}",
  "keyLocation": "${KEY_LOCATION}",
  "urlList": ${URL_JSON}
}
ENDJSON
)

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST \
  "https://api.indexnow.org/IndexNow" \
  -H "Content-Type: application/json; charset=utf-8" \
  -d "$PAYLOAD")

HTTP_CODE=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | head -n -1)

if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "202" ]; then
  echo "SUCCESS (HTTP $HTTP_CODE): ${#URLS[@]} URLs submitted to Bing IndexNow."
else
  echo "WARNING (HTTP $HTTP_CODE): $BODY"
fi
