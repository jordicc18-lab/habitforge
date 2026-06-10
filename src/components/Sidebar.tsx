import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, CheckSquare, Calendar, BarChart2, Trophy, Gift, BookOpen, Sparkles, Settings } from 'lucide-react'

const links = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/habits', icon: CheckSquare, label: 'Hábitos' },
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

  return (
    <aside className="w-64 min-h-screen bg-gray-900 border-r border-gray-800 flex flex-col p-4">
      <div className="mb-8 px-2">
        <h1 className="text-xl font-bold text-violet-400">HabitForge</h1>
        <p className="text-xs text-gray-500">Tu sistema de hábitos</p>
      </div>
      <nav className="flex flex-col gap-1">
        {links.map(({ to, icon: Icon, label }) => {
          const active = location.pathname === to
          return (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                active
                  ? 'bg-violet-600 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <Icon size={18} />
              {label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}

export default Sidebar