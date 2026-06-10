import { useHabitContext } from '../context/HabitContext'

function getDaysInYear(year: number) {
  const days = []
  const date = new Date(year, 0, 1)
  while (date.getFullYear() === year) {
    days.push(new Date(date))
    date.setDate(date.getDate() + 1)
  }
  return days
}

const MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

function Calendar() {
  const { habits } = useHabitContext()
  const year = new Date().getFullYear()
  const days = getDaysInYear(year)

  const getColor = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    const total = habits.length
    if (total === 0) return 'bg-gray-800'
    const completed = habits.filter(h => h.completedDates.includes(dateStr)).length
    const pct = completed / total
    if (pct === 0) return 'bg-gray-800'
    if (pct < 0.25) return 'bg-violet-900'
    if (pct < 0.5) return 'bg-violet-700'
    if (pct < 0.75) return 'bg-violet-500'
    return 'bg-violet-400'
  }

  const firstDay = new Date(year, 0, 1).getDay()
  const emptyDays = Array(firstDay).fill(null)

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-1">Calendario</h1>
      <p className="text-gray-400 mb-6">Actividad anual {year}</p>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <div className="flex gap-1 mb-2">
          {MONTHS.map((m, i) => (
            <div key={i} className="flex-1 text-center text-xs text-gray-500">{m}</div>
          ))}
        </div>

        <div className="grid gap-1" style={{ gridTemplateColumns: 'repeat(53, 1fr)' }}>
          {emptyDays.map((_, i) => (
            <div key={`e-${i}`} className="w-3 h-3 rounded-sm" />
          ))}
          {days.map((day, i) => (
            <div
              key={i}
              title={day.toISOString().split('T')[0]}
              className={`w-3 h-3 rounded-sm ${getColor(day)}`}
            />
          ))}
        </div>

        <div className="flex items-center gap-2 mt-4 justify-end">
          <span className="text-xs text-gray-500">Menos</span>
          <div className="w-3 h-3 rounded-sm bg-gray-800" />
          <div className="w-3 h-3 rounded-sm bg-violet-900" />
          <div className="w-3 h-3 rounded-sm bg-violet-700" />
          <div className="w-3 h-3 rounded-sm bg-violet-500" />
          <div className="w-3 h-3 rounded-sm bg-violet-400" />
          <span className="text-xs text-gray-500">Más</span>
        </div>
      </div>
    </div>
  )
}

export default Calendar