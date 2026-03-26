#!/usr/bin/env bash
# fetch-stitch.sh <url> <output_file>
# Follows redirects, handles GCS auth tokens
set -e
URL="$1"
OUT="$2"
mkdir -p "$(dirname "$OUT")"
curl -sL --max-redirs 10 -o "$OUT" "$URL"
echo "Saved to $OUT ($(wc -c < "$OUT") bytes)"
