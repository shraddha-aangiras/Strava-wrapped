#!/usr/bin/env bash
# deploy.sh — Build frontend and sync to S3
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
FRONTEND_DIR="${ROOT_DIR}/frontend"
INFRA_DIR="${ROOT_DIR}/infra"

echo "▶ Reading Terraform outputs..."
cd "${INFRA_DIR}"
S3_BUCKET=$(terraform output -raw s3_bucket_name)
OAUTH_CALLBACK_URL=$(terraform output -raw oauth_callback_url)

echo "▶ Building frontend..."
cd "${FRONTEND_DIR}"
npm ci
export VITE_REDIRECT_URI="${OAUTH_CALLBACK_URL}"
npm run build

echo "▶ Syncing to S3 (bucket: ${S3_BUCKET})..."
# Long-lived cache for hashed asset files (Vite adds content hash to filenames)
aws s3 sync "${FRONTEND_DIR}/dist/" "s3://${S3_BUCKET}/" \
  --delete \
  --cache-control "public, max-age=31536000, immutable" \
  --exclude "index.html"

# index.html must never be cached — it references the hashed assets
aws s3 cp "${FRONTEND_DIR}/dist/index.html" \
  "s3://${S3_BUCKET}/index.html" \
  --cache-control "no-cache, no-store, must-revalidate"

echo "✅ Deploy complete!"
echo "   Site: http://$(cd "${INFRA_DIR}" && terraform output -raw s3_website_endpoint)/"
