export const SPORT_ICONS = {
  Run: '🏃',
  TrailRun: '🏃',
  VirtualRun: '🏃',
  Ride: '🚴',
  GravelRide: '🚵',
  MountainBikeRide: '🚵',
  VirtualRide: '🚴',
  Swim: '🏊',
  Walk: '🚶',
  Hike: '🥾',
  WeightTraining: '🏋️',
  Workout: '💪',
  Crossfit: '💪',
  Yoga: '🧘',
  Soccer: '⚽',
  Tennis: '🎾',
  AlpineSki: '⛷️',
  BackcountrySki: '⛷️',
  NordicSki: '⛷️',
  Snowboard: '🏂',
  Kayaking: '🛶',
  Rowing: '🚣',
  StandUpPaddling: '🏄',
  Surf: '🏄',
  Golf: '⛳',
  RockClimbing: '🧗',
  IceSkate: '⛸️',
  Elliptical: '〰️',
  StairStepper: '🪜',
  Basketball: '🏀',
  Football: '🏈',
  Handball: '🤾',
  Volleyball: '🏐',
  Badminton: '🏸',
  Pickleball: '🏓',
  default: '🏅',
}

export function getSportIcon(sportType) {
  return SPORT_ICONS[sportType] || SPORT_ICONS.default
}

export function formatDuration(seconds) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

export function formatDistance(meters, sportType) {
  // Swimming typically shown in meters/yards
  if (sportType === 'Swim') {
    if (meters >= 1000) return `${(meters / 1000).toFixed(1)} km`
    return `${Math.round(meters)} m`
  }
  const km = meters / 1000
  if (km >= 100) return `${Math.round(km)} km`
  return `${km.toFixed(1)} km`
}

export function formatElevation(meters) {
  if (meters >= 10000) return `${Math.round(meters / 1000)}k m`
  return `${Math.round(meters).toLocaleString()} m`
}

export function processStats(activities) {
  if (!activities || activities.length === 0) return null

  // --- Top 4 sports by duration ---
  const sportMap = {}
  for (const act of activities) {
    const sport = act.sport_type || act.type || 'Workout'
    if (!sportMap[sport]) {
      sportMap[sport] = {
        name: sport,
        totalTime: 0,
        totalDistance: 0,
        totalElevation: 0,
        days: new Set(),
        count: 0,
        longestActivity: null,
      }
    }
    const s = sportMap[sport]
    s.totalTime += act.moving_time || 0
    s.totalDistance += act.distance || 0
    s.totalElevation += act.total_elevation_gain || 0
    s.count++

    // Track unique active days
    const day = act.start_date_local?.slice(0, 10) || act.start_date?.slice(0, 10)
    if (day) s.days.add(day)

    // Track longest activity within sport
    if (!s.longestActivity || (act.moving_time || 0) > (s.longestActivity.moving_time || 0)) {
      s.longestActivity = act
    }
  }

  // Sort by total time, take top 4
  const topSports = Object.values(sportMap)
    .sort((a, b) => b.totalTime - a.totalTime)
    .slice(0, 4)
    .map((s) => ({ ...s, days: s.days.size }))

  const topSport = topSports[0]

  // --- Total hours across all activities ---
  const totalSeconds = activities.reduce((sum, a) => sum + (a.moving_time || 0), 0)

  // --- Longest activity overall ---
  const longestActivity = activities.reduce((max, a) =>
    (a.moving_time || 0) > (max?.moving_time || 0) ? a : max, null)

  // --- Max time for bar chart scaling ---
  const maxSportTime = topSports[0]?.totalTime || 1

  return {
    topSports: topSports.map((s) => ({
      ...s,
      barWidth: Math.round((s.totalTime / maxSportTime) * 100),
    })),
    topSport,
    totalSeconds,
    totalHours: totalSeconds / 3600,
    totalActivities: activities.length,
    longestActivity,
  }
}
