import { useState } from 'react'
import { useHabitContext } from '../context/HabitContext'
import PageTransition from '../components/PageTransition'

function getBestStreak(completedDates: string[]) {
  const dates = [...completedDates].sort()
  let best = 0, current = 0
  for (let i = 0; i < dates.length; i++) {
    if (i === 0) { current = 1; continue }
    const diff = (new Date(dates[i]).getTime() - new Date(dates[i-1]).getTime()) / 86400000
    current = diff === 1 ? current + 1 : 1
    best = Math.max(best, current)
  }
  return Math.max(best, current)
}

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

function CircleProgress({ pct, color, size = 80 }: { pct: number, color: string, size?: number }) {
  const r = (size - 10) / 2
  const circumference = 2 * Math.PI * r
  const offset = circumference - (pct / 100) * circumference
  return (
    <svg width={size} height={size} className="rotate-[-90deg]">
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#1f2937" strokeWidth={8} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={8}
        strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.5s ease' }}
      />
    </svg>
  )
}

const PERIODS = [
  { label: '1 sem', days: 7 },
  { label: '2 sem', days: 14 },
  { label: '1 mes', days: 30 },
  { label: '3 mes', days: 90 },
  { label: '6 mes', days: 180 },
  { label: '1 año', days: 365 },
]

function Stats() {
  const { habits } = useHabitContext()
  const [selectedPeriod, setSelectedPeriod] = useState(28)

  const today = new Date().toISOString().split('T')[0]
  const completedToday = habits.filter(h => h.completedDates.includes(today)).length
  const totalToday = habits.length
  const pctToday = totalToday === 0 ? 0 : Math.round((completedToday / totalToday) * 100)
  const totalCompletions = habits.reduce((acc, h) => acc + h.completedDates.length, 0)
  const bestStreak = Math.max(0, ...habits.map(h => getBestStreak(h.completedDates)))
  const currentStreak = Math.max(0, ...habits.map(h => getCurrentStreak(h.completedDates)))

  const chartData = Array.from({ length: selectedPeriod }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (selectedPeriod - 1 - i))
    const dateStr = d.toISOString().split('T')[0]
    const completed = habits.filter(h => h.completedDates.includes(dateStr)).length
    const pct = habits.length === 0 ? 0 : Math.round((completed / habits.length) * 100)
    return { dateStr, pct }
  })

  const maxPct = Math.max(...chartData.map(d => d.pct), 1)

  return (
    <PageTransition>
      <div className="pt-14 md:pt-0 pb-4">
        <h1 className="text-2xl font-bold text-white mb-1">Estadísticas</h1>
        <p className="text-gray-400 mb-6">Resumen de tu progreso</p>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <p className="text-gray-400 text-xs mb-1">Hoy</p>
            <p className="text-2xl font-bold text-white">{completedToday}/{totalToday}</p>
            <p className="text-violet-400 text-xs mt-1">{pctToday}%</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <p className="text-gray-400 text-xs mb-1">Total</p>
            <p className="text-2xl font-bold text-white">{totalCompletions}</p>
            <p className="text-violet-400 text-xs mt-1">completados</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <p className="text-gray-400 text-xs mb-1">Racha actual</p>
            <p className="text-2xl font-bold text-white">{currentStreak} días</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <p className="text-gray-400 text-xs mb-1">Mejor racha</p>
            <p className="text-2xl font-bold text-white">{bestStreak} días</p>
          </div>
        </div>

        {/* Gráfica con selector de periodo */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold">Progreso</h2>
            <div className="flex gap-1">
              {PERIODS.map(p => (
                <button
                  key={p.days}
                  onClick={() => setSelectedPeriod(p.days)}
                  className={`px-2 py-1 rounded-lg text-xs transition-colors ${selectedPeriod === p.days ? 'bg-violet-600 text-white' : 'text-gray-400 hover:text-white'}`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-end gap-0.5 h-24">
            {chartData.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
                <div
                  className="w-full rounded-t-sm transition-all"
                  style={{
                    height: `${(d.pct / maxPct) * 100}%`,
                    backgroundColor: d.pct > 75 ? '#8b5cf6' : d.pct > 50 ? '#6d28d9' : d.pct > 25 ? '#4c1d95' : '#1f2937',
                    minHeight: d.pct > 0 ? '4px' : '0px'
                  }}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-xs text-gray-500">Hace {selectedPeriod} días</span>
            <span className="text-xs text-gray-500">Hoy</span>
          </div>
        </div>

        {/* Círculos de porcentaje */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold">Por hábito</h2>
            <span className="text-gray-500 text-xs">Últimos {selectedPeriod} días</span>
          </div>
          {habits.length === 0 ? (
            <p className="text-gray-500 text-sm">No tienes hábitos todavía</p>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {habits.map(habit => {
                const periodDates = Array.from({ length: selectedPeriod }, (_, i) => {
                  const d = new Date()
                  d.setDate(d.getDate() - i)
                  return d.toISOString().split('T')[0]
                })
                const completed = periodDates.filter(d => habit.completedDates.includes(d)).length
                const pct = Math.round((completed / selectedPeriod) * 100)
                return (
                  <div key={habit.id} className="flex flex-col items-center gap-2">
                    <div className="relative">
                      <CircleProgress pct={pct} color={habit.color} size={80} />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-white text-sm font-bold">{pct}%</span>
                      </div>
                    </div>
                    <p className="text-white text-xs text-center font-medium">{habit.name}</p>
                    <p className="text-gray-500 text-xs">{completed}/{selectedPeriod} días</p>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  )
}

export default Stats