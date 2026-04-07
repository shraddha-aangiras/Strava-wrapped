const STRAVA_CLIENT_ID = import.meta.env.VITE_STRAVA_CLIENT_ID
const REDIRECT_URI = import.meta.env.VITE_REDIRECT_URI || 'http://localhost:3001/auth/callback'

export default function Login() {
  function handleConnect() {
    const params = new URLSearchParams({
      client_id: STRAVA_CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      response_type: 'code',
      approval_prompt: 'auto',
      scope: 'read,activity:read_all',
    })
    window.location.href = `https://www.strava.com/oauth/authorize?${params}`
  }

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center px-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-strava-orange/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-strava-orange/5 blur-3xl" />
      </div>

      <div className="relative max-w-md w-full text-center animate-fade-in">
        {/* Logo / Icon */}
        <div className="mb-8">
          <div className="w-20 h-20 rounded-2xl bg-strava-orange flex items-center justify-center mx-auto mb-4 shadow-lg shadow-strava-orange/30">
            <span className="text-4xl">🏅</span>
          </div>
          <h1 className="text-5xl font-black text-white tracking-tight">
            Activities <span className="text-strava-orange">Wrapped</span>
          </h1>
          <p className="text-dark-500 text-lg mt-3 text-gray-400">
            Your year in sport — visualized.
          </p>
        </div>

        {/* Features preview */}
        <div className="grid grid-cols-2 gap-3 mb-10 text-left">
          {[
            { icon: '🏆', label: 'Top sports by duration' },
            { icon: '⏱️', label: 'Total hours active' },
            { icon: '📏', label: 'Distance & elevation' },
            { icon: '🔥', label: 'Longest activity' },
          ].map(({ icon, label }) => (
            <div key={label} className="flex items-center gap-2 bg-dark-700 rounded-xl px-4 py-3">
              <span className="text-xl">{icon}</span>
              <span className="text-sm text-gray-300 font-medium">{label}</span>
            </div>
          ))}
        </div>

        {/* Connect button */}
        <button
          onClick={handleConnect}
          className="w-full flex items-center justify-center gap-3 bg-strava-orange hover:bg-strava-dark text-white font-bold py-4 px-8 rounded-2xl text-lg transition-all duration-200 shadow-lg shadow-strava-orange/30 hover:shadow-strava-orange/50 hover:scale-[1.02] active:scale-[0.98]"
        >
          <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white" xmlns="http://www.w3.org/2000/svg">
            <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
          </svg>
          Connect with Strava
        </button>

        <p className="text-gray-600 text-xs mt-4">
          Read-only access. We only view your activities.
        </p>
      </div>
    </div>
  )
}
