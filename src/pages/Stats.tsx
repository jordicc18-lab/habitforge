import { useHabitContext } from '../context/HabitContext'

function Stats() {
  const { habits } = useHabitContext()

  const today = new Date().toISOString().split('T')[0]
  const completedToday = habits.filter(h => h.completedDates.includes(today)).length
  const totalToday = habits.length
  const pctToday = totalToday === 0 ? 0 : Math.round((completedToday / totalToday) * 100)

  const getBestStreak = (habit: { completedDates: string[] }) => {
    const dates = [...habit.completedDates].sort()
    let best = 0, current = 0
    for (let i = 0; i < dates.length; i++) {
      if (i === 0) { current = 1; continue }
      const prev = new Date(dates[i - 1])
      const curr = new Date(dates[i])
      const diff = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24)
      current = diff === 1 ? current + 1 : 1
      best = Math.max(best, current)
    }
    return Math.max(best, current)
  }

  const getCurrentStreak = (habit: { completedDates: string[] }) => {
    const dates = [...habit.completedDates].sort().reverse()
    if (dates.length === 0) return 0
    let streak = 0
    let check = new Date()
    for (const date of dates) {
      const d = new Date(date)
      const diff = Math.round((check.getTime() - d.getTime()) / (1000 * 60 * 60 * 24))
      if (diff <= 1) { streak++; check = d } else break
    }
    return streak
  }

  const totalCompletions = habits.reduce((acc, h) => acc + h.completedDates.length, 0)
  const bestStreak = habits.reduce((acc, h) => Math.max(acc, getBestStreak(h)), 0)
  const currentStreak = habits.reduce((acc, h) => Math.max(acc, getCurrentStreak(h)), 0)

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-1">Estadísticas</h1>
      <p className="text-gray-400 mb-8">Resumen de tu progreso</p>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <p className="text-gray-400 text-sm mb-1">Completados hoy</p>
          <p className="text-3xl font-bold text-white">{completedToday}/{totalToday}</p>
          <p className="text-violet-400 text-sm mt-1">{pctToday}% del día</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <p className="text-gray-400 text-sm mb-1">Total completados</p>
          <p className="text-3xl font-bold text-white">{totalCompletions}</p>
          <p className="text-violet-400 text-sm mt-1">desde el inicio</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <p className="text-gray-400 text-sm mb-1">Racha actual</p>
          <p className="text-3xl font-bold text-white">{currentStreak} días</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <p className="text-gray-400 text-sm mb-1">Mejor racha</p>
          <p className="text-3xl font-bold text-white">{bestStreak} días</p>
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <h2 className="text-white font-semibold mb-4">Hábitos</h2>
        {habits.length === 0 ? (
          <p className="text-gray-500">No tienes hábitos todavía</p>
        ) : (
          <div className="flex flex-col gap-3">
            {habits.map(habit => {
              const pct = habit.completedDates.length === 0 ? 0 :
                Math.round((habit.completedDates.length / 30) * 100)
              return (
                <div key={habit.id}>
                  <div className="flex justify-between mb-1">
                    <span className="text-white text-sm">{habit.name}</span>
                    <span className="text-gray-400 text-sm">{habit.completedDates.length} veces</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all"
                      style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: habit.color }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default Stats
