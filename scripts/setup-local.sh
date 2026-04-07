#!/usr/bin/env bash
# setup-local.sh — First-time local dev setup
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

echo "▶ Installing frontend dependencies..."
cd "${ROOT_DIR}/frontend"
npm install

echo "▶ Installing backend dependencies..."
cd "${ROOT_DIR}/backend"
npm install

# Create .env files if they don't exist
if [ ! -f "${ROOT_DIR}/backend/.env" ]; then
  cp "${ROOT_DIR}/.env.example" "${ROOT_DIR}/backend/.env"
  echo "  Created backend/.env — fill in your Strava credentials"
fi

if [ ! -f "${ROOT_DIR}/frontend/.env" ]; then
  cp "${ROOT_DIR}/frontend/.env.example" "${ROOT_DIR}/frontend/.env"
  echo "  Created frontend/.env — fill in your Strava Client ID"
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "  1. Go to https://www.strava.com/settings/api"
echo "  2. Create an app (or use existing)"
echo "  3. Set Authorization Callback Domain to: localhost"
echo "  4. Fill in backend/.env with STRAVA_CLIENT_ID and STRAVA_CLIENT_SECRET"
echo "  5. Fill in frontend/.env with VITE_STRAVA_CLIENT_ID"
echo ""
echo "Then run:"
echo "  Terminal 1: cd backend && npm run dev"
echo "  Terminal 2: cd frontend && npm run dev"
echo "  Open:       http://localhost:5173/strava-wrapped/"
