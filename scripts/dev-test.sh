#!/usr/bin/env bash
set -euo pipefail
curl -s -X POST http://localhost:3002/api/wish \
  -H "Content-Type: application/json" \
  -d '{"name":"Dev","message":"Hello from dev"}' | jq .
