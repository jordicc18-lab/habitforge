import { signOut } from 'firebase/auth'
import { auth } from '../lib/firebase'
import { LogOut, User, Moon, Sun, Zap } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import PageTransition from '../components/PageTransition'

function Settings() {
  const user = auth.currentUser
  const { theme, setTheme } = useTheme()

  const handleLogout = async () => {
    await signOut(auth)
  }

  const themes = [
    { id: 'dark', label: 'Oscuro', icon: Moon, desc: 'Tema oscuro clásico' },
    { id: 'amoled', label: 'AMOLED', icon: Zap, desc: 'Negro puro para OLED' },
    { id: 'light', label: 'Claro', icon: Sun, desc: 'Tema claro para el día' },
  ]

  return (
    <PageTransition>
      <div className="pt-14 md:pt-0">
        <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Configuración</h1>
        <p className="mb-8" style={{ color: 'var(--text-secondary)' }}>Gestiona tu cuenta y preferencias</p>

        <div className="flex flex-col gap-4">
          <div className="border rounded-xl p-5" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
            <h2 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Perfil</h2>
            <div className="flex items-center gap-4">
              {user?.photoURL ? (
                <img src={user.photoURL} className="w-12 h-12 rounded-full" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-violet-600 flex items-center justify-center">
                  <User size={20} className="text-white" />
                </div>
              )}
              <div>
                <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{user?.displayName || 'Usuario'}</p>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{user?.email}</p>
              </div>
            </div>
          </div>

          <div className="border rounded-xl p-5" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
            <h2 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Tema</h2>
            <div className="grid grid-cols-3 gap-3">
              {themes.map(({ id, label, icon: Icon, desc }) => (
                <button
                  key={id}
                  onClick={() => setTheme(id as 'dark' | 'light' | 'amoled')}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${theme === id ? 'border-violet-500' : 'border-transparent'}`}
                  style={{ backgroundColor: 'var(--bg-tertiary)' }}
                >
                  <Icon size={22} className={theme === id ? 'text-violet-400' : ''} style={{ color: theme === id ? '' : 'var(--text-secondary)' }} />
                  <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{label}</span>
                  <span className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>{desc}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="border rounded-xl p-5" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
            <h2 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Cuenta</h2>
            <button onClick={handleLogout} className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-lg transition-colors">
              <LogOut size={18} /> Cerrar sesión
            </button>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}

export default Settings