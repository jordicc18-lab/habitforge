import { useState } from 'react'
import { X } from 'lucide-react'
import type { Habit } from '../types/habit'

interface Props {
  habit: Habit
  onEdit: (id: string, data: Partial<Omit<Habit, 'id' | 'createdAt' | 'completedDates'>>) => void
  onClose: () => void
}

const categories = ['Personal', 'Estudio', 'Gimnasio', 'Trabajo', 'Salud']

function EditHabitModal({ habit, onEdit, onClose }: Props) {
  const [name, setName] = useState(habit.name)
  const [description, setDescription] = useState(habit.description)
  const [category, setCategory] = useState(habit.category)
  const [color, setColor] = useState(habit.color)
  const [frequency, setFrequency] = useState(habit.frequency)

  const handleSubmit = () => {
    if (!name.trim()) return
    onEdit(habit.id, { name, description, category, color, frequency })
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white font-bold text-lg">Editar hábito</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <label className="text-gray-400 text-sm mb-1 block">Nombre</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500"
            />
          </div>

          <div>
            <label className="text-gray-400 text-sm mb-1 block">Descripción</label>
            <input
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Opcional"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500"
            />
          </div>

          <div>
            <label className="text-gray-400 text-sm mb-1 block">Categoría</label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-violet-500"
            >
              {categories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-gray-400 text-sm mb-1 block">Frecuencia</label>
            <select
              value={frequency}
              onChange={e => setFrequency(e.target.value as Habit['frequency'])}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-violet-500"
            >
              <option value="daily">Diario</option>
              <option value="weekly">Semanal</option>
              <option value="monthly">Mensual</option>
            </select>
          </div>

          <div>
            <label className="text-gray-400 text-sm mb-2 block">Color personalizado</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={color}
                onChange={e => setColor(e.target.value)}
                className="w-10 h-10 rounded-lg cursor-pointer border-0 bg-transparent"
              />
              <span className="text-gray-400 text-sm">{color}</span>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            className="w-full bg-violet-600 hover:bg-violet-700 text-white font-medium py-2.5 rounded-lg transition-colors mt-2"
          >
            Guardar cambios
          </button>
        </div>
      </div>
    </div>
  )
}

export default EditHabitModal