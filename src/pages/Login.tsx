import { signInWithPopup } from 'firebase/auth'
import { auth, googleProvider } from '../lib/firebase'

function Login() {
  const handleGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider)
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-10 w-full max-w-sm text-center">
        <h1 className="text-3xl font-bold text-violet-400 mb-2">HabitForge</h1>
        <p className="text-gray-400 mb-8">Tu sistema de hábitos premium</p>

        <button
          onClick={handleGoogle}
          className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-100 text-gray-900 font-medium py-3 rounded-lg transition-colors"
        >
          <img src="https://www.google.com/favicon.ico" className="w-5 h-5" />
          Continuar con Google
        </button>
      </div>
    </div>
  )
}

export default Login