import { useState, useEffect } from 'react'
import { useHabitContext } from '../context/HabitContext'
import { ChevronLeft, ChevronRight, Plus, X, Trash2 } from 'lucide-react'
import { collection, addDoc, onSnapshot, deleteDoc, doc, updateDoc } from 'firebase/firestore'
import { db, auth } from '../lib/firebase'
import { motion, AnimatePresence } from 'framer-motion'
import PageTransition from '../components/PageTransition'

const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
const DAYS = ['L', 'M', 'X', 'J', 'V', 'S', 'D']

interface CalendarEvent {
  id: string
  title: string
  date: string
  color: string
}

interface DayMark {
  id: string
  date: string
  color: string
}

function Calendar() {
  const { habits } = useHabitContext()
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth())
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
  const [selectedDay, setSelectedDay] = useState<string | null>(null)
  const [hoveredDay, setHoveredDay] = useState<string | null>(null)
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [dayMarks, setDayMarks] = useState<DayMark[]>([])
  const [showAddEvent, setShowAddEvent] = useState(false)
  const [newEventTitle, setNewEventTitle] = useState('')
  const [newEventColor, setNewEventColor] = useState('#8b5cf6')
  const [markColor, setMarkColor] = useState('#f59e0b')
  const [lastClick, setLastClick] = useState<{ date: string, time: number } | null>(null)

  useEffect(() => {
    const user = auth.currentUser
    if (!user) return
    const eventsRef = collection(db, 'users', user.uid, 'events')
    const marksRef = collection(db, 'users', user.uid, 'dayMarks')
    const unsub1 = onSnapshot(eventsRef, snap => {
      setEvents(snap.docs.map(d => ({ id: d.id, ...d.data() } as CalendarEvent)))
    })
    const unsub2 = onSnapshot(marksRef, snap => {
      setDayMarks(snap.docs.map(d => ({ id: d.id, ...d.data() } as DayMark)))
    })
    return () => { unsub1(); unsub2() }
  }, [])

  const handleDayClick = (dateStr: string) => {
    const now = Date.now()
    if (lastClick && lastClick.date === dateStr && now - lastClick.time < 400) {
      setSelectedDay(dateStr)
      setLastClick(null)
    } else {
      setLastClick({ date: dateStr, time: now })
      setHoveredDay(dateStr)
    }
  }

  const addEvent = async () => {
    if (!newEventTitle.trim() || !selectedDay) return
    const user = auth.currentUser
    if (!user) return
    await addDoc(collection(db, 'users', user.uid, 'events'), {
      title: newEventTitle, date: selectedDay, color: newEventColor,
    })
    setNewEventTitle(''); setShowAddEvent(false)
  }

  const deleteEvent = async (id: string) => {
    const user = auth.currentUser
    if (!user) return
    await deleteDoc(doc(db, 'users', user.uid, 'events', id))
  }

  const toggleDayMark = async (dateStr: string) => {
    const user = auth.currentUser
    if (!user) return
    const existing = dayMarks.find(m => m.date === dateStr)
    if (existing) {
      await deleteDoc(doc(db, 'users', user.uid, 'dayMarks', existing.id))
    } else {
      await addDoc(collection(db, 'users', user.uid, 'dayMarks'), {
        date: dateStr, color: markColor,
      })
    }
  }

  const updateMarkColor = async (dateStr: string, color: string) => {
    const user = auth.currentUser
    if (!user) return
    const existing = dayMarks.find(m => m.date === dateStr)
    if (existing) {
      await updateDoc(doc(db, 'users', user.uid, 'dayMarks', existing.id), { color })
    }
  }

  const getHabitColor = (dateStr: string) => {
    const total = habits.length
    if (total === 0) return null
    const completed = habits.filter(h => h.completedDates.includes(dateStr)).length
    const pct = completed / total
    if (pct === 0) return null
    if (pct < 0.25) return '#4c1d95'
    if (pct < 0.5) return '#6d28d9'
    if (pct < 0.75) return '#7c3aed'
    return '#8b5cf6'
  }

  const getDaysInMonth = (month: number, year: number) => new Date(year, month + 1, 0).getDate()
  const getFirstDayOfMonth = (month: number, year: number) => {
    let day = new Date(year, month, 1).getDay()
    return day === 0 ? 6 : day - 1
  }

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1) }
    else setCurrentMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1) }
    else setCurrentMonth(m => m + 1)
  }

  const daysInMonth = getDaysInMonth(currentMonth, currentYear)
  const firstDay = getFirstDayOfMonth(currentMonth, currentYear)
  const today = new Date().toISOString().split('T')[0]

  const selectedDayEvents = selectedDay ? events.filter(e => e.date === selectedDay) : []
  const selectedDayHabits = selectedDay ? habits.filter(h => h.completedDates.includes(selectedDay)) : []
  const selectedDayPending = selectedDay ? habits.filter(h => !h.completedDates.includes(selectedDay)) : []
  const selectedDayMark = selectedDay ? dayMarks.find(m => m.date === selectedDay) : null
  const hoveredEvents = hoveredDay ? events.filter(e => e.date === hoveredDay) : []

  return (
    <PageTransition>
      <div className="pt-14 md:pt-0">
        <h1 className="text-2xl font-bold text-white mb-1">Calendario</h1>
        <p className="text-gray-400 mb-6">Toca para previsualizar · Doble toque para abrir</p>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 mb-4">
          <div className="flex items-center justify-between mb-4">
            <button onClick={prevMonth} className="text-gray-400 hover:text-white p-2"><ChevronLeft size={20} /></button>
            <h2 className="text-white font-semibold">{MONTHS[currentMonth]} {currentYear}</h2>
            <button onClick={nextMonth} className="text-gray-400 hover:text-white p-2"><ChevronRight size={20} /></button>
          </div>

          <div className="grid grid-cols-7 mb-2">
            {DAYS.map(d => <div key={d} className="text-center text-xs text-gray-500 py-1">{d}</div>)}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {Array(firstDay).fill(null).map((_, i) => <div key={`e-${i}`} />)}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1
              const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
              const isToday = dateStr === today
              const isSelected = dateStr === selectedDay
              const isHovered = dateStr === hoveredDay
              const dayEvents = events.filter(e => e.date === dateStr)
              const habitColor = getHabitColor(dateStr)
              const dayMark = dayMarks.find(m => m.date === dateStr)
              const completedCount = habits.filter(h => h.completedDates.includes(dateStr)).length

              return (
                <div
                  key={day}
                  onClick={() => handleDayClick(dateStr)}
                  className={`aspect-square rounded-lg flex flex-col items-center justify-between p-0.5 transition-all cursor-pointer relative ${isToday ? 'ring-2 ring-violet-400' : ''} ${isSelected ? 'ring-2 ring-white scale-105' : ''} ${isHovered && !isSelected ? 'ring-1 ring-gray-500' : ''}`}
                  style={{
                    backgroundColor: dayMark ? dayMark.color + '33' : habitColor ? habitColor + '44' : '#1f2937',
                    borderColor: dayMark ? dayMark.color : 'transparent',
                    border: dayMark ? `2px solid ${dayMark.color}` : undefined,
                  }}
                >
                  <span className={`text-xs font-medium mt-0.5 ${isToday ? 'text-violet-400' : 'text-gray-300'}`}>{day}</span>
                  {completedCount > 0 && (
                    <span className="text-xs text-violet-400 font-bold">{completedCount}</span>
                  )}
                  {dayEvents.length > 0 && (
                    <div className="flex gap-0.5 mb-0.5">
                      {dayEvents.slice(0, 3).map(e => (
                        <div key={e.id} className="w-1 h-1 rounded-full" style={{ backgroundColor: e.color }} />
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          <div className="flex items-center gap-3 mt-4 flex-wrap">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-sm bg-violet-900" />
              <span className="text-xs text-gray-500">Hábitos</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-blue-400" />
              <span className="text-xs text-gray-500">Eventos</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-sm ring-1 ring-yellow-400" />
              <span className="text-xs text-gray-500">Marcado</span>
            </div>
          </div>
        </div>

        {/* Previsualización al primer toque */}
        <AnimatePresence>
          {hoveredDay && !selectedDay && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="bg-gray-900 border border-gray-700 rounded-xl p-4 mb-4"
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-gray-400 text-sm">{hoveredDay}</p>
                <button onClick={() => setHoveredDay(null)} className="text-gray-600 hover:text-white">
                  <X size={16} />
                </button>
              </div>
              {hoveredEvents.length === 0 ? (
                <p className="text-gray-600 text-xs">Sin eventos — toca dos veces para abrir el día</p>
              ) : (
                <div className="flex flex-col gap-1">
                  {hoveredEvents.map(e => (
                    <div key={e.id} className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: e.color }} />
                      <span className="text-white text-sm">{e.title}</span>
                    </div>
                  ))}
                  <p className="text-gray-600 text-xs mt-1">Toca dos veces para ver más</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Panel completo al doble toque */}
        <AnimatePresence>
          {selectedDay && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              className="bg-gray-900 border border-gray-800 rounded-2xl p-4"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold">{selectedDay}</h3>
                <button onClick={() => setSelectedDay(null)} className="text-gray-400 hover:text-white">
                  <X size={18} />
                </button>
              </div>

              {/* Marcar día con color */}
              <div className="flex items-center gap-3 mb-4 p-3 bg-gray-800 rounded-xl">
                <span className="text-gray-400 text-sm">Marcar día:</span>
                <input
                  type="color"
                  value={markColor}
                  onChange={e => {
                    setMarkColor(e.target.value)
                    if (selectedDayMark) updateMarkColor(selectedDay, e.target.value)
                  }}
                  className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent"
                />
                <button
                  onClick={() => toggleDayMark(selectedDay)}
                  className={`px-3 py-1 rounded-lg text-sm transition-colors ${selectedDayMark ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-violet-600 hover:bg-violet-700 text-white'}`}
                >
                  {selectedDayMark ? 'Quitar marca' : 'Marcar'}
                </button>
              </div>

              {/* Eventos */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-white font-medium text-sm">Eventos</p>
                  <button onClick={() => setShowAddEvent(!showAddEvent)} className="flex items-center gap-1 text-violet-400 text-xs hover:text-violet-300">
                    <Plus size={14} /> Añadir
                  </button>
                </div>

                {showAddEvent && (
                  <div className="flex gap-2 mb-3">
                    <input
                      value={newEventTitle}
                      onChange={e => setNewEventTitle(e.target.value)}
                      placeholder="Nombre del evento"
                      className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-violet-500"
                    />
                    <input type="color" value={newEventColor} onChange={e => setNewEventColor(e.target.value)} className="w-10 h-10 rounded-lg cursor-pointer border-0 bg-transparent" />
                    <button onClick={addEvent} className="bg-violet-600 hover:bg-violet-700 text-white px-3 py-2 rounded-lg text-sm">OK</button>
                  </div>
                )}

                {selectedDayEvents.length === 0 ? (
                  <p className="text-gray-600 text-xs">Sin eventos</p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {selectedDayEvents.map(event => (
                      <div key={event.id} className="flex items-center justify-between rounded-lg px-3 py-2" style={{ backgroundColor: event.color + '22', border: `1px solid ${event.color}44` }}>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: event.color }} />
                          <span className="text-white text-sm">{event.title}</span>
                        </div>
                        <button onClick={() => deleteEvent(event.id)} className="text-gray-600 hover:text-red-400">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Hábitos completados */}
              {selectedDayHabits.length > 0 && (
                <div className="mb-3">
                  <p className="text-white font-medium text-sm mb-2">✅ Completados ({selectedDayHabits.length})</p>
                  <div className="flex flex-col gap-1">
                    {selectedDayHabits.map(h => (
                      <div key={h.id} className="flex items-center gap-2 bg-green-500/10 rounded-lg px-3 py-1.5">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: h.color }} />
                        <span className="text-green-400 text-sm">{h.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Hábitos pendientes */}
              {selectedDayPending.length > 0 && (
                <div>
                  <p className="text-white font-medium text-sm mb-2">⏳ Pendientes ({selectedDayPending.length})</p>
                  <div className="flex flex-col gap-1">
                    {selectedDayPending.map(h => (
                      <div key={h.id} className="flex items-center gap-2 bg-gray-800 rounded-lg px-3 py-1.5">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: h.color }} />
                        <span className="text-gray-400 text-sm">{h.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  )
}

export default Calendar