import { useState, useEffect } from 'react'
import { useHabitContext } from '../context/HabitContext'
import { ChevronLeft, ChevronRight, Plus, X, Trash2 } from 'lucide-react'
import { collection, addDoc, onSnapshot, deleteDoc, doc } from 'firebase/firestore'
import { db, auth } from '../lib/firebase'

const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
const DAYS = ['L', 'M', 'X', 'J', 'V', 'S', 'D']

interface CalendarEvent {
  id: string
  title: string
  date: string
  color: string
}

function Calendar() {
  const { habits } = useHabitContext()
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth())
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
  const [selectedDay, setSelectedDay] = useState<string | null>(null)
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [showAddEvent, setShowAddEvent] = useState(false)
  const [newEventTitle, setNewEventTitle] = useState('')
  const [newEventColor, setNewEventColor] = useState('#8b5cf6')

  useEffect(() => {
    const user = auth.currentUser
    if (!user) return
    const ref = collection(db, 'users', user.uid, 'events')
    const unsub = onSnapshot(ref, snap => {
      setEvents(snap.docs.map(d => ({ id: d.id, ...d.data() } as CalendarEvent)))
    })
    return unsub
  }, [])

  const addEvent = async () => {
    if (!newEventTitle.trim() || !selectedDay) return
    const user = auth.currentUser
    if (!user) return
    await addDoc(collection(db, 'users', user.uid, 'events'), {
      title: newEventTitle,
      date: selectedDay,
      color: newEventColor,
    })
    setNewEventTitle('')
    setShowAddEvent(false)
  }

  const deleteEvent = async (id: string) => {
    const user = auth.currentUser
    if (!user) return
    await deleteDoc(doc(db, 'users', user.uid, 'events', id))
  }

  const getColor = (dateStr: string) => {
    const total = habits.length
    if (total === 0) return 'bg-gray-800'
    const completed = habits.filter(h => h.completedDates.includes(dateStr)).length
    const pct = completed / total
    if (pct === 0) return 'bg-gray-800'
    if (pct < 0.25) return 'bg-violet-900'
    if (pct < 0.5) return 'bg-violet-700'
    if (pct < 0.75) return 'bg-violet-500'
    return 'bg-violet-400'
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

  const selectedDayHabits = selectedDay ? habits.filter(h => h.completedDates.includes(selectedDay)) : []
  const selectedDayEvents = selectedDay ? events.filter(e => e.date === selectedDay) : []
  const selectedDayPending = selectedDay ? habits.filter(h => !h.completedDates.includes(selectedDay)) : []

  return (
    <div className="pt-14 md:pt-0">
      <h1 className="text-2xl font-bold text-white mb-1">Calendario</h1>
      <p className="text-gray-400 mb-6">Progreso mensual</p>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 mb-4">
        <div className="flex items-center justify-between mb-4">
          <button onClick={prevMonth} className="text-gray-400 hover:text-white p-2">
            <ChevronLeft size={20} />
          </button>
          <h2 className="text-white font-semibold">{MONTHS[currentMonth]} {currentYear}</h2>
          <button onClick={nextMonth} className="text-gray-400 hover:text-white p-2">
            <ChevronRight size={20} />
          </button>
        </div>

        <div className="grid grid-cols-7 mb-2">
          {DAYS.map(d => (
            <div key={d} className="text-center text-xs text-gray-500 py-1">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {Array(firstDay).fill(null).map((_, i) => <div key={`e-${i}`} />)}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1
            const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
            const isToday = dateStr === today
            const isSelected = dateStr === selectedDay
            const hasEvents = events.some(e => e.date === dateStr)
            return (
              <div
                key={day}
                onClick={() => setSelectedDay(dateStr === selectedDay ? null : dateStr)}
                className={`aspect-square rounded-lg flex flex-col items-center justify-center text-xs font-medium transition-all cursor-pointer relative ${getColor(dateStr)} ${isToday ? 'ring-2 ring-violet-400' : ''} ${isSelected ? 'ring-2 ring-white' : ''}`}
              >
                <span className={isToday ? 'text-white' : 'text-gray-400'}>{day}</span>
                {hasEvents && <div className="w-1 h-1 rounded-full bg-yellow-400 absolute bottom-1" />}
              </div>
            )
          })}
        </div>

        <div className="flex items-center gap-2 mt-4 justify-end">
          <span className="text-xs text-gray-500">Menos</span>
          <div className="w-3 h-3 rounded-sm bg-gray-800" />
          <div className="w-3 h-3 rounded-sm bg-violet-900" />
          <div className="w-3 h-3 rounded-sm bg-violet-700" />
          <div className="w-3 h-3 rounded-sm bg-violet-500" />
          <div className="w-3 h-3 rounded-sm bg-violet-400" />
          <span className="text-xs text-gray-500">Más</span>
        </div>
      </div>

      {/* Panel del día seleccionado */}
      {selectedDay && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold">{selectedDay}</h3>
            <button onClick={() => setSelectedDay(null)} className="text-gray-400 hover:text-white">
              <X size={18} />
            </button>
          </div>

          {/* Eventos */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-400 text-sm">Eventos</p>
              <button
                onClick={() => setShowAddEvent(!showAddEvent)}
                className="flex items-center gap-1 text-violet-400 text-xs hover:text-violet-300"
              >
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
                <input
                  type="color"
                  value={newEventColor}
                  onChange={e => setNewEventColor(e.target.value)}
                  className="w-10 h-10 rounded-lg cursor-pointer border-0 bg-transparent"
                />
                <button
                  onClick={addEvent}
                  className="bg-violet-600 hover:bg-violet-700 text-white px-3 py-2 rounded-lg text-sm"
                >
                  OK
                </button>
              </div>
            )}

            {selectedDayEvents.length === 0 ? (
              <p className="text-gray-600 text-xs">Sin eventos</p>
            ) : (
              <div className="flex flex-col gap-2">
                {selectedDayEvents.map(event => (
                  <div key={event.id} className="flex items-center justify-between bg-gray-800 rounded-lg px-3 py-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: event.color }} />
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
              <p className="text-gray-400 text-sm mb-2">✅ Hábitos completados</p>
              <div className="flex flex-col gap-1">
                {selectedDayHabits.map(h => (
                  <div key={h.id} className="flex items-center gap-2">
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
              <p className="text-gray-400 text-sm mb-2">⏳ Pendientes</p>
              <div className="flex flex-col gap-1">
                {selectedDayPending.map(h => (
                  <div key={h.id} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: h.color }} />
                    <span className="text-gray-400 text-sm">{h.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default Calendar