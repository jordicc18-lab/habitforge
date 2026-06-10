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