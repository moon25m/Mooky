#!/usr/bin/env bash
set -euo pipefail
: "${DEPLOY_URL:=https://mookyuniverse.vercel.app}"
echo "POST ${DEPLOY_URL}/api/wish"
curl -s -X POST "${DEPLOY_URL}/api/wish" \
  -H "Content-Type: application/json" \
  -d '{"name":"Prod","message":"Hello from prod"}' | jq .
