import { getSportIcon, formatDuration, formatDistance, formatElevation } from '../utils/statsProcessor'

const AVAILABLE_YEARS = Array.from(
  { length: 10 },
  (_, i) => new Date().getFullYear() - i,
)

export default function Dashboard({ athlete, stats, year, onYearChange, onLogout }) {
  if (!stats) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-4xl mb-4">😴</p>
          <p className="text-gray-400 text-xl">No activities found for {year}</p>
          <p className="text-gray-600 mt-2">Try selecting a different year</p>
          <div className="mt-6 flex flex-col items-center gap-4">
            <YearSelector year={year} onChange={onYearChange} />
            <button
              onClick={onLogout}
              className="text-sm text-gray-500 hover:text-gray-300 transition-colors px-4 py-2 rounded-lg hover:bg-dark-700"
            >
              Log out
            </button>
          </div>
        </div>
      </div>
    )
  }

  const { topSports, topSport, totalHours, totalActivities, longestActivity } = stats

  return (
    <div className="min-h-screen bg-dark-900 text-white">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-dark-900/80 backdrop-blur-md border-b border-dark-600">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-strava-orange flex items-center justify-center">
              <span className="text-sm">🏅</span>
            </div>
            <span className="font-bold text-lg tracking-tight">
              Strava <span className="text-strava-orange">Wrapped</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <YearSelector year={year} onChange={onYearChange} />
            <button
              onClick={onLogout}
              className="text-sm text-gray-500 hover:text-gray-300 transition-colors px-3 py-1.5 rounded-lg hover:bg-dark-700"
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-10 space-y-8 animate-fade-in">
        {/* Hero */}
        <section className="text-center py-4">
          {athlete?.profile_medium && (
            <img
              src={athlete.profile_medium}
              alt={athlete.firstname}
              className="w-16 h-16 rounded-full mx-auto mb-4 border-2 border-strava-orange"
            />
          )}
          <h1 className="text-4xl font-black tracking-tight">
            {athlete?.firstname ? `${athlete.firstname}'s` : 'Your'}{' '}
            <span className="text-strava-orange">{year}</span> Wrapped
          </h1>
          <p className="text-gray-500 mt-2">
            {totalActivities} activities logged
          </p>
        </section>

        {/* Top-line stats */}
        <section className="grid grid-cols-2 gap-4">
          <div className="stat-card col-span-2 sm:col-span-1">
            <p className="text-gray-500 text-sm font-medium uppercase tracking-wider mb-1">
              Total Hours Active
            </p>
            <p className="text-5xl font-black text-white">
              {Math.floor(totalHours).toLocaleString()}
              <span className="text-2xl font-semibold text-strava-orange ml-1">h</span>
              {Math.round((totalHours % 1) * 60) > 0 && (
                <span className="text-2xl font-semibold text-gray-500 ml-1">
                  {Math.round((totalHours % 1) * 60)}m
                </span>
              )}
            </p>
            <p className="text-gray-600 text-sm mt-1">across all sports</p>
          </div>
          <div className="stat-card col-span-2 sm:col-span-1">
            <p className="text-gray-500 text-sm font-medium uppercase tracking-wider mb-1">
              Activities
            </p>
            <p className="text-5xl font-black text-white">{totalActivities.toLocaleString()}</p>
            <p className="text-gray-600 text-sm mt-1">
              avg {formatDuration(Math.round(stats.totalSeconds / totalActivities))} each
            </p>
          </div>
        </section>

        {/* Top 4 sports by duration */}
        <section className="stat-card">
          <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
            <span className="text-strava-orange">📊</span> Top Sports by Duration
          </h2>
          <div className="space-y-5">
            {topSports.map((sport, index) => (
              <SportRow key={sport.name} sport={sport} index={index} />
            ))}
          </div>
        </section>

        {/* Top sport deep dive */}
        {topSport && (
          <section>
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <span className="text-strava-orange">🥇</span> Your #1 Sport
            </h2>
            <TopSportDetail sport={topSport} />
          </section>
        )}

        {/* Longest activity */}
        {longestActivity && (
          <section className="stat-card">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <span className="text-strava-orange">⚡</span> Longest Activity
            </h2>
            <LongestActivity activity={longestActivity} />
          </section>
        )}

        <footer className="text-center text-gray-700 text-sm pb-6">
          Made with{' '}
          <span className="text-strava-orange">♥</span> using the Strava API
        </footer>
      </main>
    </div>
  )
}

function YearSelector({ year, onChange }) {
  return (
    <select
      value={year}
      onChange={(e) => onChange(Number(e.target.value))}
      className="bg-dark-700 text-white text-sm font-medium rounded-lg px-3 py-1.5 border border-dark-500 hover:border-strava-orange/50 focus:border-strava-orange outline-none cursor-pointer transition-colors"
    >
      {AVAILABLE_YEARS.map((y) => (
        <option key={y} value={y}>
          {y}
        </option>
      ))}
    </select>
  )
}

function SportRow({ sport, index }) {
  const medals = ['🥇', '🥈', '🥉', '4️⃣']
  const colors = [
    'from-strava-orange to-orange-400',
    'from-gray-400 to-gray-300',
    'from-amber-600 to-amber-500',
    'from-gray-600 to-gray-500',
  ]

  return (
    <div className="group">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <span className="text-lg w-6 text-center">{medals[index]}</span>
          <span className="text-xl">{getSportIcon(sport.name)}</span>
          <div>
            <span className="font-semibold text-white">{formatSportName(sport.name)}</span>
            <span className="text-gray-600 text-xs ml-2">{sport.count} activities</span>
          </div>
        </div>
        <span className="text-gray-400 font-mono text-sm tabular-nums">
          {formatDuration(sport.totalTime)}
        </span>
      </div>
      {/* Bar */}
      <div className="ml-9 h-2 bg-dark-500 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${colors[index]}`}
          style={{
            '--bar-width': `${sport.barWidth}%`,
            animation: 'barFill 1.2s ease-out forwards',
            width: 0,
          }}
          ref={(el) => {
            if (el) {
              requestAnimationFrame(() => {
                el.style.width = `${sport.barWidth}%`
              })
            }
          }}
        />
      </div>
    </div>
  )
}

function TopSportDetail({ sport }) {
  const stats = [
    {
      label: 'Days Active',
      value: sport.days.toLocaleString(),
      unit: 'days',
      icon: '📅',
    },
    {
      label: 'Total Distance',
      value: formatDistance(sport.totalDistance, sport.name),
      icon: '📏',
    },
    {
      label: 'Total Time',
      value: formatDuration(sport.totalTime),
      icon: '⏱️',
    },
    {
      label: 'Total Elevation',
      value: formatElevation(sport.totalElevation),
      icon: '⛰️',
    },
  ]

  return (
    <div className="bg-gradient-to-br from-strava-orange/10 to-dark-700 rounded-2xl border border-strava-orange/20 p-6">
      {/* Sport header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 rounded-2xl bg-strava-orange/20 flex items-center justify-center text-3xl">
          {getSportIcon(sport.name)}
        </div>
        <div>
          <p className="text-gray-500 text-sm">Top sport</p>
          <h3 className="text-2xl font-black text-white">{formatSportName(sport.name)}</h3>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        {stats.map(({ label, value, unit, icon }) => (
          <div key={label} className="bg-dark-900/50 rounded-xl p-4">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-sm">{icon}</span>
              <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">{label}</p>
            </div>
            <p className="text-2xl font-black text-white leading-none">
              {value}
              {unit && <span className="text-sm font-semibold text-gray-500 ml-1">{unit}</span>}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

function LongestActivity({ activity }) {
  const sport = activity.sport_type || activity.type || 'Workout'
  const date = new Date(activity.start_date_local || activity.start_date)
  const formattedDate = date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <div className="flex items-start gap-4">
      <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center text-2xl flex-shrink-0">
        {getSportIcon(sport)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-white text-lg truncate">
          {activity.name}
        </p>
        <p className="text-gray-500 text-sm">
          {formattedDate} · {formatSportName(sport)}
        </p>
        <div className="flex flex-wrap gap-3 mt-3">
          <Pill label="Duration" value={formatDuration(activity.moving_time)} />
          {activity.distance > 0 && (
            <Pill label="Distance" value={formatDistance(activity.distance, sport)} />
          )}
          {activity.total_elevation_gain > 0 && (
            <Pill label="Elevation" value={formatElevation(activity.total_elevation_gain)} />
          )}
        </div>
      </div>
    </div>
  )
}

function Pill({ label, value }) {
  return (
    <div className="bg-dark-600 rounded-lg px-3 py-1.5">
      <p className="text-gray-500 text-xs uppercase tracking-wider">{label}</p>
      <p className="text-white font-bold text-sm">{value}</p>
    </div>
  )
}

function formatSportName(name) {
  // Convert camelCase / PascalCase to readable names
  return name
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (s) => s.toUpperCase())
    .trim()
}
