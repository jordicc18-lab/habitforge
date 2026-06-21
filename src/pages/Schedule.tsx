import { useState, useEffect } from 'react'
import { collection, addDoc, onSnapshot, deleteDoc, doc } from 'firebase/firestore'
import { db, auth } from '../lib/firebase'
import { Plus, X, Trash2, List, Grid3x3 } from 'lucide-react'
import type { ScheduleItem } from '../types/habit'
import PageTransition from '../components/PageTransition'

const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
const DAYS_SHORT = ['L', 'M', 'X', 'J', 'V', 'S', 'D']
const CATEGORIES = ['Personal', 'Estudio', 'Trabajo', 'Gimnasio', 'Ocio', 'Otro']
const HOURS = Array.from({ length: 17 }, (_, i) => i + 6) // 6:00 a 22:00

function Schedule() {
  const [items, setItems] = useState<ScheduleItem[]>([])
  const [view, setView] = useState<'grid' | 'list'>('list')
  const [showForm, setShowForm] = useState(false)
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const [title, setTitle] = useState('')
  const [day, setDay] = useState(0)
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('10:00')
  const [color, setColor] = useState('#8b5cf6')
  const [category, setCategory] = useState('Personal')

  useEffect(() => {
    const user = auth.currentUser
    if (!user) return
    const ref = collection(db, 'users', user.uid, 'schedule')
    const unsub = onSnapshot(ref, snap => {
      setItems(snap.docs.map(d => ({ id: d.id, ...d.data() } as ScheduleItem)))
    })
    return unsub
  }, [])

  const addItem = async () => {
    if (!title.trim()) return
    const user = auth.currentUser
    if (!user) return
    await addDoc(collection(db, 'users', user.uid, 'schedule'), {
      title, day, startTime, endTime, color, category,
    })
    setTitle('')
    setShowForm(false)
  }

  const deleteItem = async (id: string) => {
    const user = auth.currentUser
    if (!user) return
    await deleteDoc(doc(db, 'users', user.uid, 'schedule', id))
  }

  const openFormForDay = (d: number) => {
    setDay(d)
    setSelectedDay(d)
    setShowForm(true)
  }

  const sortedItemsByDay = (d: number) =>
    items.filter(i => i.day === d).sort((a, b) => a.startTime.localeCompare(b.startTime))

  const timeToMinutes = (t: string) => {
    const [h, m] = t.split(':').map(Number)
    return h * 60 + m
  }

  return (
    <PageTransition>
      <div className="pt-14 md:pt-0 pb-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Horario semanal</h1>
            <p className="text-gray-400">Organiza tu semana</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setView(view === 'grid' ? 'list' : 'grid')}
              className="bg-gray-800 hover:bg-gray-700 text-gray-300 p-2.5 rounded-lg transition-colors"
            >
              {view === 'grid' ? <List size={18} /> : <Grid3x3 size={18} />}
            </button>
            <button
              onClick={() => { setSelectedDay(null); setShowForm(true) }}
              className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2.5 rounded-lg transition-colors"
            >
              <Plus size={18} />
              Nuevo
            </button>
          </div>
        </div>

        {/* VISTA LISTA */}
        {view === 'list' && (
          <div className="flex flex-col gap-4">
            {DAYS.map((dayName, d) => (
              <div key={d} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-white font-semibold text-sm">{dayName}</h3>
                  <button onClick={() => openFormForDay(d)} className="text-violet-400 hover:text-violet-300 text-xs flex items-center gap-1">
                    <Plus size={12} /> Añadir
                  </button>
                </div>
                {sortedItemsByDay(d).length === 0 ? (
                  <p className="text-gray-600 text-xs">Sin tareas</p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {sortedItemsByDay(d).map(item => (
                      <div key={item.id} className="flex items-center justify-between rounded-lg px-3 py-2" style={{ backgroundColor: item.color + '1a', borderLeft: `3px solid ${item.color}` }}>
                        <div>
                          <p className="text-white text-sm font-medium">{item.title}</p>
                          <p className="text-gray-500 text-xs">{item.startTime} - {item.endTime} · {item.category}</p>
                        </div>
                        <button onClick={() => deleteItem(item.id)} className="text-gray-600 hover:text-red-400">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* VISTA GRID TIPO HORARIO */}
        {view === 'grid' && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-2 overflow-x-auto">
            <div className="min-w-[700px]">
              <div className="grid grid-cols-8 gap-1 mb-1">
                <div className="text-xs text-gray-500 text-center py-1"></div>
                {DAYS_SHORT.map((d, i) => (
                  <div key={i} className="text-xs text-gray-400 text-center py-1 font-medium">{d}</div>
                ))}
              </div>
              {HOURS.map(hour => (
                <div key={hour} className="grid grid-cols-8 gap-1 mb-1" style={{ height: '36px' }}>
                  <div className="text-xs text-gray-500 text-right pr-2 flex items-center justify-end">
                    {hour}:00
                  </div>
                  {Array.from({ length: 7 }, (_, d) => {
                    const itemHere = items.find(i => i.day === d && timeToMinutes(i.startTime) <= hour * 60 && timeToMinutes(i.endTime) > hour * 60)
                    return (
                      <div
                        key={d}
                        onClick={() => !itemHere && openFormForDay(d)}
                        className="rounded cursor-pointer transition-colors hover:bg-gray-800"
                        style={{ backgroundColor: itemHere ? itemHere.color + '33' : '#111827', borderLeft: itemHere ? `2px solid ${itemHere.color}` : undefined }}
                      >
                        {itemHere && timeToMinutes(itemHere.startTime) >= hour * 60 && timeToMinutes(itemHere.startTime) < hour * 60 + 60 && (
                          <p className="text-white text-[10px] px-1 truncate leading-tight pt-0.5">{itemHere.title}</p>
                        )}
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Formulario */}
        {showForm && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-white font-bold text-lg">Nueva tarea</h2>
                <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-white">
                  <X size={20} />
                </button>
              </div>
              <div className="flex flex-col gap-4">
                <div>
                  <label className="text-gray-400 text-sm mb-1 block">Título</label>
                  <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Ej: Gimnasio" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500" />
                </div>
                <div>
                  <label className="text-gray-400 text-sm mb-1 block">Día</label>
                  <select value={day} onChange={e => setDay(Number(e.target.value))} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-violet-500">
                    {DAYS.map((d, i) => <option key={i} value={i}>{d}</option>)}
                  </select>
                </div>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="text-gray-400 text-sm mb-1 block">Inicio</label>
                    <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-violet-500" />
                  </div>
                  <div className="flex-1">
                    <label className="text-gray-400 text-sm mb-1 block">Fin</label>
                    <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-violet-500" />
                  </div>
                </div>
                <div>
                  <label className="text-gray-400 text-sm mb-1 block">Categoría</label>
                  <select value={category} onChange={e => setCategory(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-violet-500">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-gray-400 text-sm mb-2 block">Color</label>
                  <input type="color" value={color} onChange={e => setColor(e.target.value)} className="w-10 h-10 rounded-lg cursor-pointer border-0 bg-transparent" />
                </div>
                <button onClick={addItem} className="w-full bg-violet-600 hover:bg-violet-700 text-white font-medium py-2.5 rounded-lg transition-colors mt-2">
                  Guardar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  )
}

export default Schedule