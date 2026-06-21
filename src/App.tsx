import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { onAuthStateChanged } from 'firebase/auth'
import type { User } from 'firebase/auth'
import { auth } from './lib/firebase'
import { HabitProvider } from './context/HabitContext'
import { ThemeProvider } from './context/ThemeContext'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import Habits from './pages/Habits'
import Schedule from './pages/Schedule'
import Calendar from './pages/Calendar'
import Stats from './pages/Stats'
import Achievements from './pages/Achievements'
import Rewards from './pages/Rewards'
import Journal from './pages/Journal'
import AI from './pages/AI'
import Settings from './pages/Settings'
import Login from './pages/Login'

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u)
      setLoading(false)
    })
    return unsub
  }, [])

  if (loading) {
    return (
      <ThemeProvider>
        <div className="min-h-screen bg-gray-950 flex items-center justify-center">
          <p className="text-violet-400 text-lg">Cargando...</p>
        </div>
      </ThemeProvider>
    )
  }

  if (!user) return <ThemeProvider><Login /></ThemeProvider>

  return (
    <ThemeProvider>
      <BrowserRouter>
        <HabitProvider>
          <div className="flex min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
            <Sidebar />
            <main className="flex-1 p-4 md:p-8 pb-20 md:pb-8">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/habits" element={<Habits />} />
                <Route path="/schedule" element={<Schedule />} />
                <Route path="/calendar" element={<Calendar />} />
                <Route path="/stats" element={<Stats />} />
                <Route path="/achievements" element={<Achievements />} />
                <Route path="/rewards" element={<Rewards />} />
                <Route path="/journal" element={<Journal />} />
                <Route path="/ai" element={<AI />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </main>
          </div>
        </HabitProvider>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App