import { useState, useEffect } from 'react'
import { Plus, Gift, Trash2, Check } from 'lucide-react'
import { collection, addDoc, deleteDoc, doc, onSnapshot, updateDoc } from 'firebase/firestore'
import { db, auth } from '../lib/firebase'
import type { Reward } from '../types/habit'
import PageTransition from '../components/PageTransition'

function Rewards() {
  const [rewards, setRewards] = useState<Reward[]>([])
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [goal, setGoal] = useState('')

  useEffect(() => {
    const user = auth.currentUser
    if (!user) return
    const ref = collection(db, 'users', user.uid, 'rewards')
    const unsub = onSnapshot(ref, snap => {
      setRewards(snap.docs.map(d => ({ id: d.id, ...d.data() } as Reward)))
    })
    return unsub
  }, [])

  const addReward = async () => {
    if (!title.trim()) return
    const user = auth.currentUser
    if (!user) return
    await addDoc(collection(db, 'users', user.uid, 'rewards'), {
      title, description, goal, unlocked: false,
      createdAt: new Date().toISOString().split('T')[0],
    })
    setTitle(''); setDescription(''); setGoal(''); setShowForm(false)
  }

  const toggleReward = async (reward: Reward) => {
    const user = auth.currentUser
    if (!user) return
    await updateDoc(doc(db, 'users', user.uid, 'rewards', reward.id), { unlocked: !reward.unlocked })
  }

  const deleteReward = async (id: string) => {
    const user = auth.currentUser
    if (!user) return
    await deleteDoc(doc(db, 'users', user.uid, 'rewards', id))
  }

  return (
    <PageTransition>
      <div className="pt-14 md:pt-0">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Recompensas</h1>
            <p className="text-gray-400">{rewards.filter(r => r.unlocked).length}/{rewards.length} conseguidas</p>
          </div>
          <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2.5 rounded-lg transition-colors">
            <Plus size={18} /> Nueva
          </button>
        </div>

        {showForm && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 mb-6">
            <h2 className="text-white font-semibold mb-4">Nueva recompensa</h2>
            <div className="flex flex-col gap-3">
              <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Ej: Comprar un libro nuevo" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500" />
              <input value={description} onChange={e => setDescription(e.target.value)} placeholder="Descripción (opcional)" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500" />
              <input value={goal} onChange={e => setGoal(e.target.value)} placeholder="Objetivo para conseguirla" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500" />
              <div className="flex gap-2">
                <button onClick={addReward} className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg transition-colors">Guardar</button>
                <button onClick={() => setShowForm(false)} className="bg-gray-800 hover:bg-gray-700 text-gray-400 px-4 py-2 rounded-lg transition-colors">Cancelar</button>
              </div>
            </div>
          </div>
        )}

        {rewards.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg mb-2">No tienes recompensas todavía</p>
            <p className="text-gray-600 text-sm">Crea una recompensa para motivarte</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {rewards.map(reward => (
              <div key={reward.id} className={`flex items-center justify-between bg-gray-900 border rounded-xl px-5 py-4 ${reward.unlocked ? 'border-yellow-500/50' : 'border-gray-800'}`}>
                <div className="flex items-center gap-4">
                  <Gift size={20} className={reward.unlocked ? 'text-yellow-400' : 'text-gray-600'} />
                  <div>
                    <p className={`font-medium ${reward.unlocked ? 'text-yellow-400' : 'text-white'}`}>{reward.title}</p>
                    {reward.goal && <p className="text-gray-500 text-sm">Objetivo: {reward.goal}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => toggleReward(reward)} className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ${reward.unlocked ? 'border-yellow-500 bg-yellow-500' : 'border-gray-600 hover:border-yellow-400'}`}>
                    {reward.unlocked && <Check size={14} className="text-white" />}
                  </button>
                  <button onClick={() => deleteReward(reward.id)} className="text-gray-600 hover:text-red-400 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageTransition>
  )
}

export default Rewards