import { useState } from 'react'
import { useHabitContext } from '../context/HabitContext'
import { Sparkles } from 'lucide-react'
import type { Habit } from '../types/habit'

function getBestStreak(habit: Habit) {
  const dates = [...habit.completedDates].sort()
  let best = 0, current = 0
  for (let i = 0; i < dates.length; i++) {
    if (i === 0) { current = 1; continue }
    const diff = (new Date(dates[i]).getTime() - new Date(dates[i-1]).getTime()) / 86400000
    current = diff === 1 ? current + 1 : 1
    best = Math.max(best, current)
  }
  return Math.max(best, current)
}

function getLastWeek(habit: Habit) {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - i)
    return habit.completedDates.includes(d.toISOString().split('T')[0])
  }).filter(Boolean).length
}

function generateInsights(habits: Habit[]) {
  if (habits.length === 0) return []

  const today = new Date().toISOString().split('T')[0]
  const completedToday = habits.filter(h => h.completedDates.includes(today)).length
  const pctToday = Math.round((completedToday / habits.length) * 100)

  const bestHabit = habits.reduce((a, b) =>
    getLastWeek(a) >= getLastWeek(b) ? a : b
  )
  const worstHabit = habits.reduce((a, b) =>
    getLastWeek(a) <= getLastWeek(b) ? a : b
  )

  const totalCompletions = habits.reduce((acc, h) => acc + h.completedDates.length, 0)
  const bestStreakHabit = habits.reduce((a, b) =>
    getBestStreak(a) >= getBestStreak(b) ? a : b
  )

  const insights = []

  if (pctToday === 100) {
    insights.push({ type: 'success', text: '🎉 ¡Has completado el 100% de tus hábitos hoy! Día perfecto.' })
  } else if (pctToday >= 50) {
    insights.push({ type: 'info', text: `📊 Hoy llevas ${completedToday} de ${habits.length} hábitos completados (${pctToday}%). ¡Buen ritmo!` })
  } else {
    insights.push({ type: 'warning', text: `⚡ Hoy solo llevas ${completedToday} de ${habits.length} hábitos. Aún estás a tiempo de mejorar.` })
  }

  insights.push({ type: 'success', text: `⭐ Tu hábito más constante esta semana es "${bestHabit.name}" con ${getLastWeek(bestHabit)}/7 días completados.` })

  if (getLastWeek(worstHabit) < 3 && worstHabit.name !== bestHabit.name) {
    insights.push({ type: 'warning', text: `⚠️ "${worstHabit.name}" necesita atención — solo ${getLastWeek(worstHabit)}/7 días esta semana.` })
  }

  insights.push({ type: 'info', text: `🏆 Tu mejor racha es con "${bestStreakHabit.name}": ${getBestStreak(bestStreakHabit)} días consecutivos.` })

  insights.push({ type: 'info', text: `📈 En total llevas ${totalCompletions} completados entre todos tus hábitos. ¡Sigue así!` })

  if (totalCompletions > 50) {
    insights.push({ type: 'success', text: '💪 Llevas más de 50 completados en total. La constancia está dando sus frutos.' })
  } else if (totalCompletions > 20) {
    insights.push({ type: 'info', text: '🌱 Vas por buen camino. La clave es la consistencia día a día.' })
  } else {
    insights.push({ type: 'info', text: '🚀 Estás empezando. Los primeros 21 días son los más difíciles — no te rindas.' })
  }

  return insights
}

function AI() {
  const { habits } = useHabitContext()
  const [showAnalysis, setShowAnalysis] = useState(false)

  const insights = generateInsights(habits)

  const colorMap: Record<string, string> = {
    success: 'border-green-500/30 bg-green-500/5',
    warning: 'border-yellow-500/30 bg-yellow-500/5',
    info: 'border-violet-500/30 bg-violet-500/5',
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-1">Análisis IA</h1>
      <p className="text-gray-400 mb-8">Tu coach personal de hábitos</p>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="text-violet-400" size={22} />
          <h2 className="text-white font-semibold">Resumen de tus hábitos</h2>
        </div>

        {habits.length === 0 ? (
          <p className="text-gray-500">Crea algunos hábitos primero para poder analizarlos.</p>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-3 mb-6">
              {habits.map(h => (
                <div key={h.id} className="bg-gray-800 rounded-lg p-3">
                  <div className="w-2 h-2 rounded-full mb-2" style={{ backgroundColor: h.color }} />
                  <p className="text-white text-sm font-medium">{h.name}</p>
                  <p className="text-gray-400 text-xs">{h.completedDates.length} completados</p>
                  <p className="text-gray-500 text-xs">{getLastWeek(h)}/7 esta semana</p>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowAnalysis(true)}
              className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2.5 rounded-lg transition-colors"
            >
              <Sparkles size={18} />
              Generar análisis
            </button>
          </>
        )}
      </div>

      {showAnalysis && insights.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="text-white font-semibold mb-2">Tu análisis personalizado</h2>
          {insights.map((insight, i) => (
            <div key={i} className={`border rounded-xl p-4 ${colorMap[insight.type]}`}>
              <p className="text-gray-200 text-sm leading-relaxed">{insight.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default AI