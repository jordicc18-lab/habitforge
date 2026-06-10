import { useState, useEffect } from 'react'
import { collection, addDoc, onSnapshot, deleteDoc, doc } from 'firebase/firestore'
import { db, auth } from '../lib/firebase'
import { Plus, Trash2, Search } from 'lucide-react'

interface JournalEntry {
  id: string
  text: string
  emoji: string
  date: string
  createdAt: string
}

const EMOJIS = ['😊', '😔', '😤', '😴', '💪', '🎯', '🔥', '✨', '😰', '🥳']

function Journal() {
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [showForm, setShowForm] = useState(false)
  const [text, setText] = useState('')
  const [emoji, setEmoji] = useState('😊')
  const [search, setSearch] = useState('')

  useEffect(() => {
    const user = auth.currentUser
    if (!user) return
    const ref = collection(db, 'users', user.uid, 'journal')
    const unsub = onSnapshot(ref, snap => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as JournalEntry))
      setEntries(data.sort((a, b) => b.createdAt.localeCompare(a.createdAt)))
    })
    return unsub
  }, [])

  const addEntry = async () => {
    if (!text.trim()) return
    const user = auth.currentUser
    if (!user) return
    const ref = collection(db, 'users', user.uid, 'journal')
    await addDoc(ref, {
      text,
      emoji,
      date: new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
      createdAt: new Date().toISOString(),
    })
    setText('')
    setEmoji('😊')
    setShowForm(false)
  }

  const deleteEntry = async (id: string) => {
    const user = auth.currentUser
    if (!user) return
    await deleteDoc(doc(db, 'users', user.uid, 'journal', id))
  }

  const filtered = entries.filter(e =>
    e.text.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Diario personal</h1>
          <p className="text-gray-400">{entries.length} entradas</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2.5 rounded-lg transition-colors"
        >
          <Plus size={18} />
          Nueva entrada
        </button>
      </div>

      <div className="relative mb-6">
        <Search size={16} className="absolute left-3 top-3 text-gray-500" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar entradas..."
          className="w-full bg-gray-900 border border-gray-800 rounded-lg pl-9 pr-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500"
        />
      </div>

      {showForm && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 mb-6">
          <h2 className="text-white font-semibold mb-4">Nueva entrada</h2>
          <div className="flex gap-2 mb-3 flex-wrap">
            {EMOJIS.map(e => (
              <button
                key={e}
                onClick={() => setEmoji(e)}
                className={`text-2xl p-1 rounded-lg transition-all ${emoji === e ? 'bg-violet-600' : 'hover:bg-gray-800'}`}
              >
                {e}
              </button>
            ))}
          </div>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="¿Cómo ha ido el día?"
            rows={4}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 resize-none mb-3"
          />
          <div className="flex gap-2">
            <button
              onClick={addEntry}
              className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Guardar
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="bg-gray-800 hover:bg-gray-700 text-gray-400 px-4 py-2 rounded-lg transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-500 text-lg mb-2">No hay entradas todavía</p>
          <p className="text-gray-600 text-sm">Pulsa "Nueva entrada" para empezar</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map(entry => (
            <div key={entry.id} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{entry.emoji}</span>
                  <span className="text-gray-400 text-sm">{entry.date}</span>
                </div>
                <button
                  onClick={() => deleteEntry(entry.id)}
                  className="text-gray-600 hover:text-red-400 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <p className="text-white text-sm leading-relaxed">{entry.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Journal