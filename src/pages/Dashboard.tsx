import { useHabitContext } from '../context/HabitContext'
import { CheckSquare, Flame, Trophy, Target } from 'lucide-react'

function getCurrentStreak(completedDates: string[]) {
  const dates = [...completedDates].sort().reverse()
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

function Dashboard() {
  const { habits, isCompletedToday } = useHabitContext()

  const completedToday = habits.filter(h => isCompletedToday(h)).length
  const totalToday = habits.length
  const pctToday = totalToday === 0 ? 0 : Math.round((completedToday / totalToday) * 100)

  const bestStreak = Math.max(0, ...habits.map(h => {
    const dates = [...h.completedDates].sort()
    let best = 0, current = 0
    for (let i = 0; i < dates.length; i++) {
      if (i === 0) { current = 1; continue }
      const diff = (new Date(dates[i]).getTime() - new Date(dates[i-1]).getTime()) / 86400000
      current = diff === 1 ? current + 1 : 1
      best = Math.max(best, current)
    }
    return Math.max(best, current)
  }))

  const currentStreak = Math.max(0, ...habits.map(h => getCurrentStreak(h.completedDates)))

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return d.toISOString().split('T')[0]
  })
  const weekCompleted = weekDays.filter(d => habits.some(h => h.completedDates.includes(d))).length
  const weekPct = Math.round((weekCompleted / 7) * 100)

  const stats = [
    { label: 'Completados hoy', value: `${completedToday}/${totalToday}`, icon: CheckSquare, color: 'text-violet-400', sub: `${pctToday}%` },
    { label: 'Racha actual', value: `${currentStreak} días`, icon: Flame, color: 'text-orange-400', sub: '' },
    { label: 'Mejor racha', value: `${bestStreak} días`, icon: Trophy, color: 'text-yellow-400', sub: '' },
    { label: 'Objetivo semanal', value: `${weekPct}%`, icon: Target, color: 'text-green-400', sub: `${weekCompleted}/7 días` },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-1">Dashboard</h1>
      <p className="text-gray-400 mb-8">Bienvenido a HabitForge</p>

      <div className="grid grid-cols-2 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon, color, sub }) => (
          <div key={label} className="bg-gray-900 rounded-xl p-5 border border-gray-800">
            <Icon className={`${color} mb-3`} size={22} />
            <p className="text-2xl font-bold text-white">{value}</p>
            {sub && <p className="text-violet-400 text-sm mt-0.5">{sub}</p>}
            <p className="text-gray-400 text-sm mt-1">{label}</p>
          </div>
        ))}
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <h2 className="text-white font-semibold mb-4">Hábitos de hoy</h2>
        {habits.length === 0 ? (
          <p className="text-gray-500 text-sm">No tienes hábitos. Ve a "Hábitos" para crear uno.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {habits.map(habit => {
              const done = isCompletedToday(habit)
              return (
                <div key={habit.id} className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${done ? 'bg-violet-400' : 'bg-gray-600'}`} />
                  <span className={`text-sm ${done ? 'text-gray-400 line-through' : 'text-white'}`}>
                    {habit.name}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard