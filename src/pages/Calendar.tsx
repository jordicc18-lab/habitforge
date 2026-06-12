import { useState } from 'react'
import { useHabitContext } from '../context/HabitContext'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
const DAYS = ['L', 'M', 'X', 'J', 'V', 'S', 'D']

function Calendar() {
  const { habits } = useHabitContext()
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth())
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())

  const getColor = (dateStr: string) => {
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

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (month: number, year: number) => {
    let day = new Date(year, month, 1).getDay()
    return day === 0 ? 6 : day - 1
  }

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear(y => y - 1)
    } else {
      setCurrentMonth(m => m - 1)
    }
  }

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear(y => y + 1)
    } else {
      setCurrentMonth(m => m + 1)
    }
  }

  const daysInMonth = getDaysInMonth(currentMonth, currentYear)
  const firstDay = getFirstDayOfMonth(currentMonth, currentYear)
  const today = new Date().toISOString().split('T')[0]

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-1">Calendario</h1>
      <p className="text-gray-400 mb-6">Progreso mensual</p>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-4">
          <button onClick={prevMonth} className="text-gray-400 hover:text-white p-2">
            <ChevronLeft size={20} />
          </button>
          <h2 className="text-white font-semibold">
            {MONTHS[currentMonth]} {currentYear}
          </h2>
          <button onClick={nextMonth} className="text-gray-400 hover:text-white p-2">
            <ChevronRight size={20} />
          </button>
        </div>

        <div className="grid grid-cols-7 mb-2">
          {DAYS.map(d => (
            <div key={d} className="text-center text-xs text-gray-500 py-1">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {Array(firstDay).fill(null).map((_, i) => (
            <div key={`e-${i}`} />
          ))}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1
            const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
            const isToday = dateStr === today
            return (
              <div
                key={day}
                className={`aspect-square rounded-lg flex items-center justify-center text-xs font-medium transition-all ${getColor(dateStr)} ${isToday ? 'ring-2 ring-violet-400' : ''}`}
              >
                <span className={isToday ? 'text-white' : 'text-gray-400'}>{day}</span>
              </div>
            )
          })}
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