import { useState } from 'react'
import { Plus, Check, Trash2 } from 'lucide-react'
import { useHabitContext } from '../context/HabitContext'
import AddHabitModal from '../components/AddHabitModal'

function Habits() {
  const { habits, addHabit, toggleHabit, deleteHabit, isCompletedToday } = useHabitContext()
  const [showModal, setShowModal] = useState(false)

  return (
    <div>
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
          Nuevo hábito
        </button>
      </div>

      {habits.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-500 text-lg mb-2">No tienes hábitos todavía</p>
          <p className="text-gray-600 text-sm">Pulsa "Nuevo hábito" para empezar</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {habits.map(habit => {
            const completed = isCompletedToday(habit)
            return (
              <div
                key={habit.id}
                className={`flex items-center justify-between bg-gray-900 border rounded-xl px-5 py-4 transition-all ${
                  completed ? 'border-violet-500/50' : 'border-gray-800'
                }`}
              >
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => toggleHabit(habit.id)}
                    className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ${
                      completed
                        ? 'border-violet-500 bg-violet-500'
                        : 'border-gray-600 hover:border-violet-400'
                    }`}
                  >
                    {completed && <Check size={14} className="text-white" />}
                  </button>
                  <div
                    className="w-2 h-10 rounded-full"
                    style={{ backgroundColor: habit.color }}
                  />
                  <div>
                    <p className={`font-medium ${completed ? 'text-gray-400 line-through' : 'text-white'}`}>
                      {habit.name}
                    </p>
                    <p className="text-gray-500 text-sm">{habit.category} · {habit.frequency === 'daily' ? 'Diario' : habit.frequency === 'weekly' ? 'Semanal' : 'Mensual'}</p>
                  </div>
                </div>
                <button
                  onClick={() => deleteHabit(habit.id)}
                  className="text-gray-600 hover:text-red-400 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
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
    </div>
  )
}

export default Habits