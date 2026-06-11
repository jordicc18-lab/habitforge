import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, CheckSquare, Calendar, BarChart2, Trophy, Gift, BookOpen, Sparkles, Settings } from 'lucide-react'

const links = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/habits', icon: CheckSquare, label: 'Hábitos' },
  { to: '/calendar', icon: Calendar, label: 'Calendario' },
  { to: '/stats', icon: BarChart2, label: 'Stats' },
  { to: '/achievements', icon: Trophy, label: 'Logros' },
  { to: '/rewards', icon: Gift, label: 'Recompensas' },
  { to: '/journal', icon: BookOpen, label: 'Diario' },
  { to: '/ai', icon: Sparkles, label: 'IA' },
  { to: '/settings', icon: Settings, label: 'Ajustes' },
]

const mainLinks = links.slice(0, 5)

function Sidebar() {
  const location = useLocation()

  return (
    <>
      {/* Sidebar escritorio */}
      <aside className="hidden md:flex w-64 min-h-screen bg-gray-900 border-r border-gray-800 flex-col p-4">
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

      {/* Barra navegación móvil */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 z-50">
        <div className="flex justify-around items-center py-2">
          {mainLinks.map(({ to, icon: Icon, label }) => {
            const active = location.pathname === to
            return (
              <Link
                key={to}
                to={to}
                className={`flex flex-col items-center gap-1 px-3 py-1 rounded-lg transition-colors ${
                  active ? 'text-violet-400' : 'text-gray-500'
                }`}
              >
                <Icon size={22} />
                <span className="text-xs">{label}</span>
              </Link>
            )
          })}
          <Link
            to="/settings"
            className={`flex flex-col items-center gap-1 px-3 py-1 rounded-lg transition-colors ${
              location.pathname === '/settings' ? 'text-violet-400' : 'text-gray-500'
            }`}
          >
            <Settings size={22} />
            <span className="text-xs">Más</span>
          </Link>
        </div>
      </nav>
    </>
  )
}

export default Sidebar