import { createContext, useContext } from 'react'
import { useHabits } from '../store/habitStore'
import type { Habit } from '../types/habit'

interface HabitContextType {
  habits: Habit[]
  addHabit: (habit: Omit<Habit, 'id' | 'createdAt' | 'completedDates'>) => void
  toggleHabit: (id: string) => void
  deleteHabit: (id: string) => void
  isCompletedToday: (habit: Habit) => boolean
}

const HabitContext = createContext<HabitContextType | null>(null)

export function HabitProvider({ children }: { children: React.ReactNode }) {
  const habits = useHabits()
  return (
    <HabitContext.Provider value={habits}>
      {children}
    </HabitContext.Provider>
  )
}

export function useHabitContext() {
  const ctx = useContext(HabitContext)
  if (!ctx) throw new Error('useHabitContext must be used within HabitProvider')
  return ctx
}