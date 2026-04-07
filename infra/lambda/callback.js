/**
 * Lambda handler — Strava OAuth callback
 *
 * Receives the authorization code from Strava, exchanges it for an
 * access token, and redirects the user back to the frontend SPA with
 * the token in the URL fragment (never sent to servers).
 */

const STRAVA_TOKEN_URL = 'https://www.strava.com/oauth/token'

exports.handler = async (event) => {
  const { STRAVA_CLIENT_ID, STRAVA_CLIENT_SECRET, FRONTEND_URL } = process.env
  const frontendUrl = FRONTEND_URL || 'https://example.com/strava-wrapped'

  const params = event.queryStringParameters || {}
  const { code, error } = params

  if (error || !code) {
    const msg = error || 'no_code'
    return redirect(`${frontendUrl}/#error=${encodeURIComponent(msg)}`)
  }

  try {
    const response = await fetch(STRAVA_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: STRAVA_CLIENT_ID,
        client_secret: STRAVA_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
      }),
    })

    const data = await response.json()

    if (!response.ok || data.errors) {
      console.error('Strava token exchange failed:', JSON.stringify(data))
      return redirect(`${frontendUrl}/#error=auth_failed`)
    }

    const { access_token, token_type = 'Bearer' } = data

    // Redirect to frontend — token in fragment, never logged or cached
    return redirect(
      `${frontendUrl}/#access_token=${access_token}&token_type=${token_type}`,
    )
  } catch (err) {
    console.error('OAuth callback error:', err)
    return redirect(`${frontendUrl}/#error=server_error`)
  }
}

function redirect(url) {
  return {
    statusCode: 302,
    headers: {
      Location: url,
      'Cache-Control': 'no-store',
    },
    body: '',
  }
}
