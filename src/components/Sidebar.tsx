import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, CheckSquare, Calendar, BarChart2, Trophy, Gift, BookOpen, Sparkles, Settings, Menu, X, Clock } from 'lucide-react'

const links = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/habits', icon: CheckSquare, label: 'Hábitos' },
  { to: '/schedule', icon: Clock, label: 'Horario' },
  { to: '/calendar', icon: Calendar, label: 'Calendario' },
  { to: '/stats', icon: BarChart2, label: 'Estadísticas' },
  { to: '/achievements', icon: Trophy, label: 'Logros' },
  { to: '/rewards', icon: Gift, label: 'Recompensas' },
  { to: '/journal', icon: BookOpen, label: 'Diario' },
  { to: '/ai', icon: Sparkles, label: 'Análisis IA' },
  { to: '/settings', icon: Settings, label: 'Configuración' },
]

function Sidebar() {
  const location = useLocation()
  const [open, setOpen] = useState(false)

  return (
    <>
      <button onClick={() => setOpen(true)} className="md:hidden fixed top-4 left-4 z-50 bg-gray-900 border border-gray-800 p-2 rounded-lg text-gray-400 hover:text-white">
        <Menu size={22} />
      </button>

      {open && <div className="md:hidden fixed inset-0 bg-black/60 z-40" onClick={() => setOpen(false)} />}

      <aside className={`md:hidden fixed top-0 left-0 h-full w-64 bg-gray-900 border-r border-gray-800 flex flex-col p-4 z-50 transition-transform duration-300 overflow-y-auto ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-xl font-bold text-violet-400">HabitForge</h1>
            <p className="text-xs text-gray-500">Tu sistema de hábitos</p>
          </div>
          <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>
        <nav className="flex flex-col gap-1">
          {links.map(({ to, icon: Icon, label }) => {
            const active = location.pathname === to
            return (
              <Link key={to} to={to} onClick={() => setOpen(false)} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${active ? 'bg-violet-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}>
                <Icon size={18} />
                {label}
              </Link>
            )
          })}
        </nav>
      </aside>

      <aside className="hidden md:flex w-64 h-screen sticky top-0 bg-gray-900 border-r border-gray-800 flex-col p-4 overflow-y-auto">
        <div className="mb-8 px-2">
          <h1 className="text-xl font-bold text-violet-400">HabitForge</h1>
          <p className="text-xs text-gray-500">Tu sistema de hábitos</p>
        </div>
        <nav className="flex flex-col gap-1">
          {links.map(({ to, icon: Icon, label }) => {
            const active = location.pathname === to
            return (
              <Link key={to} to={to} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${active ? 'bg-violet-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}>
                <Icon size={18} />
                {label}
              </Link>
            )
          })}
        </nav>
      </aside>
    </>
  )
}

export default Sidebar