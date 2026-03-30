'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Interest = { topic: string; event_id: string }
type EventHistory = { event_id: string; attended: boolean; role_at_event: string | null }

type Profile = {
  id: string
  full_name: string
  email: string
  company: string
  role: string
  sector: string
  city: string | null
  created_at: string
  interests: Interest[]
  event_history: EventHistory[]
}

type Event = {
  id: string
  name: string
  city: string
  date: string
}

type Props = {
  event: Event | null
  profiles: Profile[]
  matchesCount: number
  adminEmail: string
}

function getUniqueSectors(profiles: Profile[]): string[] {
  const sectors = profiles.map((p) => p.sector).filter(Boolean)
  return [...new Set(sectors)].sort()
}

export default function DashboardClient({ event, profiles, matchesCount, adminEmail }: Props) {
  const [search, setSearch] = useState('')
  const [sectorFilter, setSectorFilter] = useState('todos')
  const [loggingOut, setLoggingOut] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const filtered = useMemo(() => {
    return profiles.filter((p) => {
      const matchesSearch =
        search === '' ||
        p.full_name?.toLowerCase().includes(search.toLowerCase()) ||
        p.company?.toLowerCase().includes(search.toLowerCase()) ||
        p.role?.toLowerCase().includes(search.toLowerCase())
      const matchesSector = sectorFilter === 'todos' || p.sector === sectorFilter
      return matchesSearch && matchesSector
    })
  }, [profiles, search, sectorFilter])

  const sectors = getUniqueSectors(profiles)

  async function handleLogout() {
    setLoggingOut(true)
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('es-CO', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-cyan-400 flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <circle cx="4" cy="4" r="2" fill="#080D1A" />
                <circle cx="12" cy="4" r="2" fill="#080D1A" />
                <circle cx="4" cy="12" r="2" fill="#080D1A" />
                <circle cx="12" cy="12" r="2" fill="#080D1A" />
                <line x1="4" y1="4" x2="12" y2="12" stroke="#080D1A" strokeWidth="1.5" />
                <line x1="12" y1="4" x2="4" y2="12" stroke="#080D1A" strokeWidth="1.5" />
              </svg>
            </div>
            <span className="font-semibold text-white">Linker</span>
            {event && (
              <>
                <span className="text-[#2A3A52]">/</span>
                <span className="text-[#8899AA] text-sm">{event.name}</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-4">
            <span className="text-slate-400 text-xs hidden sm:block">{adminEmail}</span>
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="text-slate-400 hover:text-white text-sm transition-colors"
            >
              {loggingOut ? 'Saliendo...' : 'Cerrar sesión'}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard label="Asistentes registrados" value={profiles.length} accent="#00E5CC" />
          <StatCard label="Matches generados" value={matchesCount} accent="#F59E0B" />
          <StatCard label="Sectores representados" value={sectors.length} accent="#8B5CF6" />
          <StatCard label="Con historial C5.0" value={profiles.filter((p) => p.event_history?.length > 0).length} accent="#10B981" />
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre, empresa o cargo..."
              className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
            />
          </div>
          <select
            value={sectorFilter}
            onChange={(e) => setSectorFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-400 transition-colors min-w-[180px]"
          >
            <option value="todos">Todos los sectores</option>
            {sectors.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {(search || sectorFilter !== 'todos') && (
          <p className="text-slate-400 text-sm mb-4">
            Mostrando <span className="text-cyan-400 font-medium">{filtered.length}</span> de {profiles.length} asistentes
          </p>
        )}

        {filtered.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center">
            <p className="text-slate-400 text-sm">
              {profiles.length === 0 ? 'Aún no hay asistentes registrados.' : 'Ningún asistente coincide con la búsqueda.'}
            </p>
          </div>
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="hidden md:grid grid-cols-[2fr_2fr_1fr_1fr_auto] gap-4 px-6 py-3 border-b border-slate-800">
              {['Nombre', 'Empresa / Cargo', 'Sector', 'Registrado', ''].map((h) => (
                <span key={h} className="text-slate-400 text-xs font-medium uppercase tracking-wider">{h}</span>
              ))}
            </div>
            <div className="divide-y divide-slate-800">
              {filtered.map((profile) => (
                <AttendeeRow key={profile.id} profile={profile} formatDate={formatDate} />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

function StatCard({ label, value, accent }: { label: string; value: number; accent: string }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
      <div className="text-3xl font-bold mb-1 tabular-nums" style={{ color: accent }}>{value}</div>
      <div className="text-slate-400 text-xs leading-tight">{label}</div>
    </div>
  )
}

function AttendeeRow({ profile, formatDate }: { profile: Profile; formatDate: (d: string) => string }) {
  const hasHistory = profile.event_history?.length > 0
  const interestCount = profile.interests?.length || 0

  return (
    <div className="grid md:grid-cols-[2fr_2fr_1fr_1fr_auto] gap-4 px-6 py-4 items-center hover:bg-slate-800/40 transition-colors">
      <div>
        <div className="flex items-center gap-2">
          <span className="text-white text-sm font-medium">{profile.full_name}</span>
          {hasHistory && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              C5.0 vet
            </span>
          )}
        </div>
        <div className="text-slate-400 text-xs mt-0.5 truncate">{profile.email}</div>
      </div>
      <div>
        <div className="text-slate-200 text-sm truncate">{profile.company}</div>
        <div className="text-slate-400 text-xs mt-0.5 truncate">{profile.role}</div>
      </div>
      <div>
        <span className="inline-block text-xs px-2 py-1 rounded-md bg-slate-950 border border-slate-800 text-slate-300 truncate max-w-full">
          {profile.sector || '—'}
        </span>
      </div>
      <div className="text-slate-400 text-xs">{formatDate(profile.created_at)}</div>
      <div>
        {interestCount > 0 && (
          <span className="text-cyan-400 text-xs">{interestCount} {interestCount === 1 ? 'interés' : 'intereses'}</span>
        )}
      </div>
    </div>
  )
}
