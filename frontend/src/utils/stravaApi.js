const STRAVA_API_BASE = 'https://www.strava.com/api/v3'

export async function fetchAllActivities(accessToken, year) {
  const activities = []
  let page = 1
  const perPage = 200

  // If year is specified, set epoch bounds
  let after, before
  if (year) {
    after = Math.floor(new Date(`${year}-01-01T00:00:00Z`).getTime() / 1000)
    before = Math.floor(new Date(`${year}-12-31T23:59:59Z`).getTime() / 1000)
  }

  while (true) {
    const params = new URLSearchParams({ per_page: perPage, page })
    if (after) params.append('after', after)
    if (before) params.append('before', before)

    const response = await fetch(`${STRAVA_API_BASE}/athlete/activities?${params}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })

    if (!response.ok) {
      if (response.status === 401) throw new Error('Unauthorized — token expired')
      throw new Error(`Strava API error: ${response.status}`)
    }

    const batch = await response.json()
    if (batch.length === 0) break

    activities.push(...batch)
    if (batch.length < perPage) break
    page++
  }

  return activities
}

export async function fetchAthlete(accessToken) {
  const response = await fetch(`${STRAVA_API_BASE}/athlete`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  if (!response.ok) throw new Error('Failed to fetch athlete profile')
  return response.json()
}
