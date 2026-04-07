export default function LoadingScreen({ message }) {
  return (
    <div className="min-h-screen bg-dark-900 flex flex-col items-center justify-center gap-6">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-4 border-dark-600" />
        <div className="absolute inset-0 rounded-full border-4 border-t-strava-orange animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl">🏅</span>
        </div>
      </div>
      <p className="text-gray-400 text-lg font-medium">{message}</p>
    </div>
  )
}
