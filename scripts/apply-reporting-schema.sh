#!/usr/bin/env bash
set -euo pipefail

echo "Applying reporting schema to D1 (remote)..."
npx wrangler d1 execute japan-seasons-db --remote --file=src/db/reporting-schema.sql
echo "Done."
