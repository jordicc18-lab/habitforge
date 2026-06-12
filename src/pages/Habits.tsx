import { useState } from 'react'
import { Plus, Check, Trash2, Pencil } from 'lucide-react'
import { useHabitContext } from '../context/HabitContext'
import AddHabitModal from '../components/AddHabitModal'
import EditHabitModal from '../components/EditHabitModal'
import PageTransition from '../components/PageTransition'
import type { Habit } from '../types/habit'

function Habits() {
  const { habits, addHabit, editHabit, toggleHabit, deleteHabit, isCompletedToday } = useHabitContext()
  const [showModal, setShowModal] = useState(false)
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null)

  return (
    <PageTransition>
      <div className="pt-14 md:pt-0">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Mis Hábitos</h1>
            <p className="text-gray-400">{habits.length} hábitos creados</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2.5 rounded-lg transition-colors"
          >
            <Plus size={18} />
            Nuevo
          </button>
        </div>

        {habits.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg mb-2">No tienes hábitos todavía</p>
            <p className="text-gray-600 text-sm">Pulsa "Nuevo" para empezar</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {habits.map(habit => {
              const completed = isCompletedToday(habit)
              return (
                <div
                  key={habit.id}
                  className={`flex items-center justify-between bg-gray-900 border rounded-xl px-4 py-4 transition-all ${
                    completed ? 'border-violet-500/50' : 'border-gray-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleHabit(habit.id)}
                      className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                        completed
                          ? 'border-violet-500 bg-violet-500'
                          : 'border-gray-600 hover:border-violet-400'
                      }`}
                    >
                      {completed && <Check size={14} className="text-white" />}
                    </button>
                    <div
                      className="w-2 h-10 rounded-full flex-shrink-0"
                      style={{ backgroundColor: habit.color }}
                    />
                    <div>
                      <p className={`font-medium text-sm ${completed ? 'text-gray-400 line-through' : 'text-white'}`}>
                        {habit.name}
                      </p>
                      <p className="text-gray-500 text-xs">{habit.category} · {habit.frequency === 'daily' ? 'Diario' : habit.frequency === 'weekly' ? 'Semanal' : 'Mensual'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditingHabit(habit)}
                      className="text-gray-600 hover:text-violet-400 transition-colors"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => deleteHabit(habit.id)}
                      className="text-gray-600 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {showModal && (
          <AddHabitModal
            onAdd={addHabit}
            onClose={() => setShowModal(false)}
          />
        )}

        {editingHabit && (
          <EditHabitModal
            habit={editingHabit}
            onEdit={editHabit}
            onClose={() => setEditingHabit(null)}
          />
        )}
      </div>
    </PageTransition>
  )
}

export default Habits