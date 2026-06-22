import { useState, useEffect } from 'react'
import { useHabitContext } from '../context/HabitContext'
import { CheckSquare, Flame, Trophy, Target, Plus, X, Trash2 } from 'lucide-react'
import { collection, addDoc, onSnapshot, deleteDoc, doc, updateDoc } from 'firebase/firestore'
import { db, auth } from '../lib/firebase'
import type { TodoItem } from '../types/habit'
import PageTransition from '../components/PageTransition'

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
  const [todos, setTodos] = useState<TodoItem[]>([])
  const [showForm, setShowForm] = useState(false)
  const [text, setText] = useState('')
  const [date, setDate] = useState('')
  const [color, setColor] = useState('#8b5cf6')

  useEffect(() => {
    const user = auth.currentUser
    if (!user) return
    const ref = collection(db, 'users', user.uid, 'todos')
    const unsub = onSnapshot(ref, snap => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as TodoItem))
      setTodos(data.sort((a, b) => a.createdAt.localeCompare(b.createdAt)))
    })
    return unsub
  }, [])

  const addTodo = async () => {
    if (!text.trim()) return
    const user = auth.currentUser
    if (!user) return
    await addDoc(collection(db, 'users', user.uid, 'todos'), {
      text, date: date || '', color, completed: false,
      createdAt: new Date().toISOString(),
    })
    setText(''); setDate(''); setColor('#8b5cf6'); setShowForm(false)
  }

  const toggleTodo = async (todo: TodoItem) => {
    const user = auth.currentUser
    if (!user) return
    await updateDoc(doc(db, 'users', user.uid, 'todos', todo.id), { completed: !todo.completed })
  }

  const deleteTodo = async (id: string) => {
    const user = auth.currentUser
    if (!user) return
    await deleteDoc(doc(db, 'users', user.uid, 'todos', id))
  }

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
    <PageTransition>
      <div className="pt-14 md:pt-0">
        <h1 className="text-2xl font-bold text-white mb-1">Dashboard</h1>
        <p className="text-gray-400 mb-8">Bienvenido a HabitForge</p>

        <div className="grid grid-cols-2 gap-4 mb-8">
          {stats.map(({ label, value, icon: Icon, color: c, sub }) => (
            <div key={label} className="bg-gray-900 rounded-xl p-5 border border-gray-800">
              <Icon className={`${c} mb-3`} size={22} />
              <p className="text-2xl font-bold text-white">{value}</p>
              {sub && <p className="text-violet-400 text-sm mt-0.5">{sub}</p>}
              <p className="text-gray-400 text-sm mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* Tareas pendientes */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold">Tareas pendientes</h2>
            <button onClick={() => setShowForm(true)} className="flex items-center gap-1 text-violet-400 hover:text-violet-300 text-sm">
              <Plus size={16} /> Añadir
            </button>
          </div>

          {showForm && (
            <div className="bg-gray-800 rounded-xl p-3 mb-3 flex flex-col gap-2">
              <input
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="¿Qué tienes que hacer?"
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-violet-500"
              />
              <div className="flex gap-2">
                <input
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-2 py-2 text-white text-sm focus:outline-none focus:border-violet-500"
                />
                <input
                  type="color"
                  value={color}
                  onChange={e => setColor(e.target.value)}
                  className="w-10 h-10 rounded-lg cursor-pointer border-0 bg-transparent"
                />
              </div>
              <div className="flex gap-2">
                <button onClick={addTodo} className="flex-1 bg-violet-600 hover:bg-violet-700 text-white py-2 rounded-lg text-sm">Guardar</button>
                <button onClick={() => setShowForm(false)} className="flex-1 bg-gray-700 hover:bg-gray-600 text-gray-300 py-2 rounded-lg text-sm">Cancelar</button>
              </div>
            </div>
          )}

          {todos.length === 0 ? (
            <p className="text-gray-500 text-sm">No tienes tareas pendientes</p>
          ) : (
            <div className="flex flex-col gap-2">
              {todos.map(todo => (
                <div key={todo.id} className="flex items-center justify-between rounded-lg px-3 py-2" style={{ backgroundColor: todo.color + '1a', borderLeft: `3px solid ${todo.color}` }}>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleTodo(todo)}
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${todo.completed ? 'border-violet-500 bg-violet-500' : 'border-gray-600'}`}
                    >
                      {todo.completed && <CheckSquare size={10} className="text-white" />}
                    </button>
                    <div>
                      <p className={`text-sm ${todo.completed ? 'text-gray-500 line-through' : 'text-white'}`}>{todo.text}</p>
                      {todo.date && <p className="text-gray-500 text-xs">{todo.date}</p>}
                    </div>
                  </div>
                  <button onClick={() => deleteTodo(todo.id)} className="text-gray-600 hover:text-red-400">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
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
                    <span className={`text-sm ${done ? 'text-gray-400 line-through' : 'text-white'}`}>{habit.name}</span>
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

export default Dashboard