'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

function LoginInner() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') || '/dashboard'
  const supabase = createClient()

  async function handleLogin() {
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('Credenciales incorrectas. Verifica tu email y contraseña.')
      setLoading(false)
      return
    }

    router.push(redirectTo)
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-[#080D1A] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(#00E5CC 1px, transparent 1px), linear-gradient(90deg, #00E5CC 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative w-full max-w-sm">
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-[#00E5CC] flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="4" cy="4" r="2" fill="#080D1A" />
                <circle cx="12" cy="4" r="2" fill="#080D1A" />
                <circle cx="4" cy="12" r="2" fill="#080D1A" />
                <circle cx="12" cy="12" r="2" fill="#080D1A" />
                <line x1="4" y1="4" x2="12" y2="12" stroke="#080D1A" strokeWidth="1.5" />
                <line x1="12" y1="4" x2="4" y2="12" stroke="#080D1A" strokeWidth="1.5" />
              </svg>
            </div>
            <span className="text-white font-semibold text-xl tracking-tight">Linker</span>
          </div>
          <p className="text-[#4A5568] text-sm">Acceso administrativo · Colombia 5.0</p>
        </div>

        <div className="bg-[#0F1629] border border-[#1E2D4A] rounded-2xl p-8">
          <h1 className="text-white font-semibold text-lg mb-6">Iniciar sesión</h1>

          <div className="space-y-4">
            <div>
              <label className="block text-[#8899AA] text-xs font-medium mb-2 uppercase tracking-wider">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                placeholder="admin@colombia50.co"
                className="w-full bg-[#080D1A] border border-[#1E2D4A] rounded-lg px-4 py-3 text-white text-sm placeholder:text-[#2A3A52] focus:outline-none focus:border-[#00E5CC] transition-colors"
              />
            </div>

            <div>
              <label className="block text-[#8899AA] text-xs font-medium mb-2 uppercase tracking-wider">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                placeholder="••••••••"
                className="w-full bg-[#080D1A] border border-[#1E2D4A] rounded-lg px-4 py-3 text-white text-sm placeholder:text-[#2A3A52] focus:outline-none focus:border-[#00E5CC] transition-colors"
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <button
              onClick={handleLogin}
              disabled={loading || !email || !password}
              className="w-full bg-[#00E5CC] hover:bg-[#00CDB8] disabled:opacity-40 disabled:cursor-not-allowed text-[#080D1A] font-semibold rounded-lg py-3 text-sm transition-colors mt-2"
            >
              {loading ? 'Entrando...' : 'Entrar al dashboard'}
            </button>
          </div>
        </div>

        <p className="text-center text-[#2A3A52] text-xs mt-6">
          Solo para organizadores del evento
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginInner />
    </Suspense>
  )
}
