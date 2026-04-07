import 'dotenv/config'
import express from 'express'
import fetch from 'node-fetch'

const app = express()
const PORT = process.env.PORT || 3001

const {
  STRAVA_CLIENT_ID,
  STRAVA_CLIENT_SECRET,
  FRONTEND_URL = 'http://localhost:5173',
} = process.env

if (!STRAVA_CLIENT_ID || !STRAVA_CLIENT_SECRET) {
  console.error('Missing STRAVA_CLIENT_ID or STRAVA_CLIENT_SECRET in environment')
  process.exit(1)
}

// Health check
app.get('/health', (_req, res) => res.json({ ok: true }))

// OAuth callback — exchanges authorization code for access token
app.get('/auth/callback', async (req, res) => {
  const { code, error } = req.query

  if (error || !code) {
    const message = error || 'No authorization code received'
    console.error('OAuth error:', message)
    return res.redirect(`${FRONTEND_URL}/strava-wrapped/#error=${encodeURIComponent(message)}`)
  }

  try {
    const tokenRes = await fetch('https://www.strava.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: STRAVA_CLIENT_ID,
        client_secret: STRAVA_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
      }),
    })

    if (!tokenRes.ok) {
      const body = await tokenRes.text()
      throw new Error(`Token exchange failed: ${tokenRes.status} ${body}`)
    }

    const data = await tokenRes.json()

    if (data.errors) {
      throw new Error(data.message || 'Strava token error')
    }

    const { access_token, token_type } = data

    // Redirect to frontend with token in URL fragment (not sent to server)
    const redirectUrl = `${FRONTEND_URL}/strava-wrapped/#access_token=${access_token}&token_type=${token_type}`
    res.redirect(redirectUrl)
  } catch (err) {
    console.error('Token exchange error:', err.message)
    res.redirect(
      `${FRONTEND_URL}/strava-wrapped/#error=${encodeURIComponent('Authentication failed')}`,
    )
  }
})

app.listen(PORT, () => {
  console.log(`✅  OAuth server running on http://localhost:${PORT}`)
  console.log(`   Callback URL: http://localhost:${PORT}/auth/callback`)
})
