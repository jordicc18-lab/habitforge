import { useState, useEffect } from 'react'
import { collection, addDoc, deleteDoc, doc, onSnapshot, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore'
import { db, auth } from '../lib/firebase'
import type { Habit } from '../types/habit'

const today = () => new Date().toISOString().split('T')[0]

export function useHabits() {
  const [habits, setHabits] = useState<Habit[]>([])

  useEffect(() => {
    const user = auth.currentUser
    if (!user) return
    const ref = collection(db, 'users', user.uid, 'habits')
    const unsub = onSnapshot(ref, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as Habit))
      setHabits(data)
    })
    return unsub
  }, [])

  const addHabit = async (habit: Omit<Habit, 'id' | 'createdAt' | 'completedDates'>) => {
    const user = auth.currentUser
    if (!user) return
    const ref = collection(db, 'users', user.uid, 'habits')
    await addDoc(ref, {
      ...habit,
      createdAt: today(),
      completedDates: [],
    })
  }

  const editHabit = async (id: string, data: Partial<Omit<Habit, 'id' | 'createdAt' | 'completedDates'>>) => {
    const user = auth.currentUser
    if (!user) return
    const ref = doc(db, 'users', user.uid, 'habits', id)
    await updateDoc(ref, data)
  }

  const toggleHabit = async (id: string) => {
    const user = auth.currentUser
    if (!user) return
    const date = today()
    const habit = habits.find(h => h.id === id)
    if (!habit) return
    const ref = doc(db, 'users', user.uid, 'habits', id)
    if (habit.completedDates.includes(date)) {
      await updateDoc(ref, { completedDates: arrayRemove(date) })
    } else {
      await updateDoc(ref, { completedDates: arrayUnion(date) })
    }
  }

  const deleteHabit = async (id: string) => {
    const user = auth.currentUser
    if (!user) return
    await deleteDoc(doc(db, 'users', user.uid, 'habits', id))
  }

  const isCompletedToday = (habit: Habit) => {
    return habit.completedDates.includes(today())
  }

  return { habits, addHabit, editHabit, toggleHabit, deleteHabit, isCompletedToday }
}