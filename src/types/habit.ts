export interface Habit {
  id: string
  name: string
  description: string
  category: string
  color: string
  frequency: 'daily' | 'weekly' | 'monthly'
  createdAt: string
  completedDates: string[]
}

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  unlocked: boolean
  condition: (habits: Habit[]) => boolean
}

export interface Reward {
  id: string
  title: string
  description: string
  goal: string
  unlocked: boolean
  createdAt: string
}

export interface ScheduleItem {
  id: string
  title: string
  day: number // 0 = Lunes, 6 = Domingo
  startTime: string // "18:00"
  endTime: string // "19:00"
  color: string
  category: string
}

export interface TodoItem {
  id: string
  text: string
  date: string
  color: string
  completed: boolean
  createdAt: string
}