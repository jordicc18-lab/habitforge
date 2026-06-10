import { useHabitContext } from '../context/HabitContext'
import type { Achievement } from '../types/habit'

function getAchievements(habits: ReturnType<typeof useHabitContext>['habits']): Achievement[] {
  const totalCompletions = habits.reduce((acc, h) => acc + h.completedDates.length, 0)

  const getBestStreak = () => {
    let best = 0
    for (const habit of habits) {
      const dates = [...habit.completedDates].sort()
      let current = 0
      for (let i = 0; i < dates.length; i++) {
        if (i === 0) { current = 1; continue }
        const diff = (new Date(dates[i]).getTime() - new Date(dates[i-1]).getTime()) / 86400000
        current = diff === 1 ? current + 1 : 1
        best = Math.max(best, current)
      }
      best = Math.max(best, current)
    }
    return best
  }

  const achievements: Achievement[] = [
    {
      id: '1',
      title: 'Primer paso',
      description: 'Crea tu primer hábito',
      icon: '🌱',
      rarity: 'common',
      unlocked: habits.length >= 1,
      condition: (h) => h.length >= 1,
    },
    {
      id: '2',
      title: 'Constante',
      description: 'Completa un hábito 7 días seguidos',
      icon: '🔥',
      rarity: 'common',
      unlocked: getBestStreak() >= 7,
      condition: () => getBestStreak() >= 7,
    },
    {
      id: '3',
      title: 'Imparable',
      description: 'Completa un hábito 30 días seguidos',
      icon: '⚡',
      rarity: 'rare',
      unlocked: getBestStreak() >= 30,
      condition: () => getBestStreak() >= 30,
    },
    {
      id: '4',
      title: 'Coleccionista',
      description: 'Crea 5 hábitos',
      icon: '📚',
      rarity: 'rare',
      unlocked: habits.length >= 5,
      condition: (h) => h.length >= 5,
    },
    {
      id: '5',
      title: 'Centenario',
      description: 'Acumula 100 completados',
      icon: '💯',
      rarity: 'epic',
      unlocked: totalCompletions >= 100,
      condition: () => totalCompletions >= 100,
    },
    {
      id: '6',
      title: 'Leyenda',
      description: 'Mantén una racha de 100 días',
      icon: '👑',
      rarity: 'legendary',
      unlocked: getBestStreak() >= 100,
      condition: () => getBestStreak() >= 100,
    },
  ]

  return achievements
}

const rarityColors: Record<string, string> = {
  common: 'border-gray-600 text-gray-400',
  rare: 'border-blue-500 text-blue-400',
  epic: 'border-purple-500 text-purple-400',
  legendary: 'border-yellow-500 text-yellow-400',
}

const rarityLabels: Record<string, string> = {
  common: 'Común',
  rare: 'Raro',
  epic: 'Épico',
  legendary: 'Legendario',
}

function Achievements() {
  const { habits } = useHabitContext()
  const achievements = getAchievements(habits)
  const unlocked = achievements.filter(a => a.unlocked).length

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-1">Logros</h1>
      <p className="text-gray-400 mb-8">{unlocked}/{achievements.length} desbloqueados</p>

      <div className="grid grid-cols-2 gap-4">
        {achievements.map(a => (
          <div
            key={a.id}
            className={`bg-gray-900 border rounded-xl p-5 transition-all ${
              a.unlocked ? rarityColors[a.rarity] : 'border-gray-800 opacity-50'
            }`}
          >
            <div className="text-4xl mb-3">{a.unlocked ? a.icon : '🔒'}</div>
            <p className={`font-semibold mb-1 ${a.unlocked ? 'text-white' : 'text-gray-500'}`}>
              {a.title}
            </p>
            <p className="text-gray-400 text-sm mb-2">{a.description}</p>
            <span className={`text-xs font-medium ${a.unlocked ? rarityColors[a.rarity] : 'text-gray-600'}`}>
              {rarityLabels[a.rarity]}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Achievements
