import { useState } from 'react'
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth'
import { auth, googleProvider } from '../lib/firebase'

type Mode = 'login' | 'register' | 'reset'

function Login() {
  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider)
    } catch (err) {
      console.error(err)
    }
  }

  const handleEmailAuth = async () => {
    setError('')
    setMessage('')
    if (!email || !password) {
      setError('Rellena todos los campos')
      return
    }
    setLoading(true)
    try {
      if (mode === 'login') {
        await signInWithEmailAndPassword(auth, email, password)
      } else if (mode === 'register') {
        await createUserWithEmailAndPassword(auth, email, password)
      }
    } catch (err: unknown) {
      const code = (err as { code?: string }).code
      if (code === 'auth/email-already-in-use') setError('Este correo ya está registrado')
      else if (code === 'auth/invalid-email') setError('Correo no válido')
      else if (code === 'auth/weak-password') setError('La contraseña debe tener al menos 6 caracteres')
      else if (code === 'auth/invalid-credential' || code === 'auth/wrong-password') setError('Correo o contraseña incorrectos')
      else if (code === 'auth/user-not-found') setError('No existe una cuenta con ese correo')
      else setError('Ha ocurrido un error, inténtalo de nuevo')
    }
    setLoading(false)
  }

  const handleReset = async () => {
    setError('')
    setMessage('')
    if (!email) {
      setError('Escribe tu correo electrónico')
      return
    }
    setLoading(true)
    try {
      await sendPasswordResetEmail(auth, email)
      setMessage('Te hemos enviado un correo para restablecer tu contraseña')
    } catch {
      setError('No se pudo enviar el correo. Comprueba que esté bien escrito')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 w-full max-w-sm">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-violet-400 mb-2">HabitForge</h1>
          <p className="text-gray-400 text-sm">
            {mode === 'login' && 'Inicia sesión en tu cuenta'}
            {mode === 'register' && 'Crea una cuenta nueva'}
            {mode === 'reset' && 'Recupera tu contraseña'}
          </p>
        </div>

        {mode !== 'reset' && (
          <>
            <button
              onClick={handleGoogle}
              className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-100 text-gray-900 font-medium py-3 rounded-lg transition-colors mb-4"
            >
              <img src="https://www.google.com/favicon.ico" className="w-5 h-5" />
              Continuar con Google
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px bg-gray-800" />
              <span className="text-gray-500 text-xs">o con tu correo</span>
              <div className="flex-1 h-px bg-gray-800" />
            </div>
          </>
        )}

        <div className="flex flex-col gap-3">
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Correo electrónico"
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500"
          />

          {mode !== 'reset' && (
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Contraseña"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500"
            />
          )}

          {error && <p className="text-red-400 text-sm">{error}</p>}
          {message && <p className="text-green-400 text-sm">{message}</p>}

          {mode === 'reset' ? (
            <button
              onClick={handleReset}
              disabled={loading}
              className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg transition-colors"
            >
              {loading ? 'Enviando...' : 'Enviar correo de recuperación'}
            </button>
          ) : (
            <button
              onClick={handleEmailAuth}
              disabled={loading}
              className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg transition-colors"
            >
              {loading ? 'Cargando...' : mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
            </button>
          )}
        </div>

        <div className="text-center mt-5 flex flex-col gap-2">
          {mode === 'login' && (
            <>
              <button onClick={() => { setMode('register'); setError(''); setMessage('') }} className="text-violet-400 hover:text-violet-300 text-sm">
                ¿No tienes cuenta? Regístrate
              </button>
              <button onClick={() => { setMode('reset'); setError(''); setMessage('') }} className="text-gray-500 hover:text-gray-400 text-xs">
                ¿Olvidaste tu contraseña?
              </button>
            </>
          )}
          {mode === 'register' && (
            <button onClick={() => { setMode('login'); setError(''); setMessage('') }} className="text-violet-400 hover:text-violet-300 text-sm">
              ¿Ya tienes cuenta? Inicia sesión
            </button>
          )}
          {mode === 'reset' && (
            <button onClick={() => { setMode('login'); setError(''); setMessage('') }} className="text-violet-400 hover:text-violet-300 text-sm">
              Volver a iniciar sesión
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default Login