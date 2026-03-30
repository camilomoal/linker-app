'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginClient() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('Credenciales incorrectas. Intenta de nuevo.')
      setLoading(false)
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <div className="min-h-screen bg-brand-black flex flex-col items-center justify-center px-4">

      {/* Logo 3GOVideo */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center flex-shrink-0">
          <span className="text-white font-bold text-[11px] tracking-tight">3GO</span>
        </div>
        <div>
          <div className="text-white font-bold text-lg leading-none">
            <span className="text-brand-primary">3GO</span>Video
          </div>
          <div className="text-brand-muted text-[10px] mt-0.5">Powered by 3GOVideo</div>
        </div>
      </div>

      {/* Card */}
      <div className="w-full max-w-sm bg-brand-surface border border-brand-border rounded-2xl p-8">

        {/* Badge evento */}
        <div className="inline-flex items-center gap-2 bg-brand-primary/10 border border-brand-primary/30 rounded-full px-3 py-1.5 mb-5">
          <div className="w-1.5 h-1.5 rounded-full bg-brand-primary" />
          <span className="text-brand-secondary text-xs font-medium">
            Colombia 5.0 · Santander
          </span>
        </div>

        <h1 className="text-white text-xl font-semibold mb-1">
          Acceso administrador
        </h1>
        <p className="text-brand-muted text-sm mb-6">
          Panel de gestión de asistentes · Linker
        </p>

        <form onSubmit={handleLogin} className="space-y-4">

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-brand-muted text-[11px] uppercase tracking-wider mb-1.5">
              Correo electrónico
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="admin@3govideo.com"
              className="w-full bg-brand-surface2 border border-brand-border rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-brand-muted focus:outline-none focus:border-brand-primary transition-colors"
            />
          </div>

          <div>
            <label className="block text-brand-muted text-[11px] uppercase tracking-wider mb-1.5">
              Contraseña
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-brand-surface2 border border-brand-border rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-brand-muted focus:outline-none focus:border-brand-primary transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-semibold text-white text-sm bg-brand-primary hover:bg-brand-primary-dim disabled:opacity-50 transition-colors mt-2"
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </button>

        </form>

        <p className="text-center text-brand-muted text-[11px] mt-6">
          www.3GOVideo.com · Go8G@3GOVideo.com
        </p>
      </div>
    </div>
  )
}

