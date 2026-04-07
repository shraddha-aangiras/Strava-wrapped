import { useState, useEffect } from 'react'
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import LoadingScreen from './components/LoadingScreen'
import { fetchAllActivities, fetchAthlete } from './utils/stravaApi'
import { processStats } from './utils/statsProcessor'

const DEFAULT_YEAR = new Date().getFullYear() - 1

export default function App() {
  const [state, setState] = useState('idle') // idle | loading | ready | error
  const [athlete, setAthlete] = useState(null)
  const [stats, setStats] = useState(null)
  const [year, setYear] = useState(DEFAULT_YEAR)
  const [error, setError] = useState(null)
  const [loadingMessage, setLoadingMessage] = useState('Connecting to Strava...')

  // On mount: check for access token in URL hash or sessionStorage
  useEffect(() => {
    const hash = window.location.hash
    let token = null

    if (hash.includes('access_token=')) {
      const params = new URLSearchParams(hash.replace('#', ''))
      token = params.get('access_token')
      // Clean the URL so token isn't visible
      window.history.replaceState(null, '', window.location.pathname)
      if (token) sessionStorage.setItem('strava_token', token)
    } else {
      token = sessionStorage.getItem('strava_token')
    }

    if (token) loadData(token, year)
  }, [])

  async function loadData(token, selectedYear) {
    setState('loading')
    setError(null)

    try {
      setLoadingMessage('Fetching your profile...')
      const athleteData = await fetchAthlete(token)
      setAthlete(athleteData)

      setLoadingMessage(`Loading ${selectedYear} activities...`)
      const activities = await fetchAllActivities(token, selectedYear)

      setLoadingMessage('Crunching the numbers...')
      const processed = processStats(activities)
      setStats(processed)
      setState('ready')
    } catch (err) {
      if (err.message.includes('Unauthorized')) {
        sessionStorage.removeItem('strava_token')
        setState('idle')
      } else {
        setError(err.message)
        setState('error')
      }
    }
  }

  function handleYearChange(newYear) {
    setYear(newYear)
    const token = sessionStorage.getItem('strava_token')
    if (token) loadData(token, newYear)
  }

  async function handleLogout() {
    const token = sessionStorage.getItem('strava_token')

    // Immediately clear the local session for a snappy UI response.
    sessionStorage.removeItem('strava_token')
    setAthlete(null)
    setStats(null)
    setState('idle')

    if (token) {
      try {
        // Deauthorize the app on Strava's side to ensure a full logout.
        // This forces the user to re-approve the app on the next login,
        // allowing them to switch accounts.
        await fetch('https://www.strava.com/oauth/deauthorize', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        })
      } catch (err) {
        console.error('Failed to deauthorize Strava token:', err)
        // Don't block the logout if deauthorization fails.
      }
    }
  }

  if (state === 'idle') return <Login />

  if (state === 'loading') return <LoadingScreen message={loadingMessage} />

  if (state === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-900">
        <div className="text-center">
          <p className="text-red-400 text-xl mb-4">{error}</p>
          <button
            onClick={() => setState('idle')}
            className="px-6 py-3 bg-strava-orange rounded-xl font-semibold hover:bg-strava-dark transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <Dashboard
      athlete={athlete}
      stats={stats}
      year={year}
      onYearChange={handleYearChange}
      onLogout={handleLogout}
    />
  )
}
