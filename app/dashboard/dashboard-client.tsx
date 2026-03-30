'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

type Profile = {
  id: string
  nombre: string
  email: string
  cargo: string
  empresa: string
  sector: string
  created_at: string
}

type Props = {
  profiles: Profile[]
  totalCount: number
}

function NavItem({
  icon,
  label,
  active,
}: {
  icon: string
  label: string
  active?: boolean
}) {
  return (
    <div
      className={`
        flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm cursor-pointer transition-colors
        ${active
          ? 'bg-brand-primary/15 text-brand-primary'
          : 'text-brand-muted hover:bg-brand-surface hover:text-white'}
      `}
    >
      <span className="text-sm w-4 text-center">{icon}</span>
      {label}
    </div>
  )
}

export default function DashboardClient({ profiles, totalCount }: Props) {
  const [search, setSearch] = useState('')
  const [sector, setSector] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const sectores = Array.from(new Set(profiles.map(p => p.sector))).filter(Boolean)

  const filtered = profiles.filter(p => {
    const matchSearch =
      p.nombre?.toLowerCase().includes(search.toLowerCase()) ||
      p.email?.toLowerCase().includes(search.toLowerCase()) ||
      p.empresa?.toLowerCase().includes(search.toLowerCase())
    const matchSector = sector === '' || p.sector === sector
    return matchSearch && matchSector
  })

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  // Stats
  const empresasUnicas = new Set(profiles.map(p => p.empresa)).size
  const sectorTop = sectores.reduce(
    (acc, s) => {
      const count = profiles.filter(p => p.sector === s).length
      return count > acc.count ? { name: s, count } : acc
    },
    { name: '', count: 0 }
  )

  return (
    <div className="flex min-h-screen bg-brand-bg">

      {/* ── Sidebar ── */}
      <aside className="w-56 min-w-56 bg-brand-black border-r border-brand-border flex flex-col">

        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 py-5 border-b border-brand-border">
          <div className="w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-[10px]">3GO</span>
          </div>
          <div>
            <div className="text-white font-bold text-sm leading-none">
              <span className="text-brand-primary">3GO</span>Video
            </div>
            <div className="text-brand-muted text-[10px] mt-0.5">Linker Admin</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          <p className="text-brand-muted text-[10px] uppercase tracking-widest px-2 pb-2">
            Evento
          </p>
          <NavItem icon="⊡" label="Inicio" active />
          <NavItem icon="◎" label="Asistentes" />
          <NavItem icon="⬡" label="Matches" />
          <p className="text-brand-muted text-[10px] uppercase tracking-widest px-2 pt-4 pb-2">
            Sistema
          </p>
          <NavItem icon="◈" label="Configuración" />
          <NavItem icon="◷" label="Reportes" />
        </nav>

        {/* Footer usuario */}
        <div className="px-4 py-4 border-t border-brand-border space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-brand-primary flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              CA
            </div>
            <div>
              <p className="text-white text-xs font-medium leading-none">Camilo</p>
              <p className="text-brand-muted text-[10px] mt-0.5">Admin Principal</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full text-left text-brand-muted text-xs hover:text-white transition-colors px-1"
          >
            Cerrar sesión →
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Topbar */}
        <header className="h-14 bg-brand-card border-b border-gray-200 flex items-center justify-between px-6 flex-shrink-0">
          <h1 className="text-gray-900 font-semibold text-base">Panel de Control</h1>
          <div className="flex items-center gap-2 bg-brand-primary/10 border border-brand-primary/25 rounded-full px-3 py-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-brand-primary" />
            <span className="text-[#1670A0] text-xs font-medium">
              Colombia 5.0 · Santander
            </span>
          </div>
        </header>

        <main className="flex-1 p-6 space-y-6 overflow-auto">

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-brand-card border border-gray-200 border-l-4 border-l-brand-primary rounded-xl p-4">
              <p className="text-brand-muted text-[11px] uppercase tracking-wider mb-1">
                Asistentes registrados
              </p>
              <p className="text-gray-900 text-3xl font-bold">{totalCount}</p>
              <p className="text-brand-primary text-xs mt-1">Total del evento</p>
            </div>
            <div className="bg-brand-card border border-gray-200 rounded-xl p-4">
              <p className="text-brand-muted text-[11px] uppercase tracking-wider mb-1">
                Empresas presentes
              </p>
              <p className="text-gray-900 text-3xl font-bold">{empresasUnicas}</p>
              <p className="text-brand-muted text-xs mt-1">Organizaciones únicas</p>
            </div>
            <div className="bg-brand-card border border-gray-200 rounded-xl p-4">
              <p className="text-brand-muted text-[11px] uppercase tracking-wider mb-1">
                Sector líder
              </p>
              <p className="text-gray-900 text-2xl font-bold truncate">{sectorTop.name || '—'}</p>
              <p className="text-brand-muted text-xs mt-1">{sectorTop.count} asistentes</p>
            </div>
          </div>

          {/* Filtros */}
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Buscar por nombre, email o empresa..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="flex-1 bg-brand-card border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 text-sm placeholder:text-brand-muted focus:outline-none focus:border-brand-primary transition-colors"
            />
            <select
              value={sector}
              onChange={e => setSector(e.target.value)}
              className="bg-brand-card border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 text-sm focus:outline-none focus:border-brand-primary transition-colors"
            >
              <option value="">Todos los sectores</option>
              {sectores.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Tabla */}
          <div className="bg-brand-card border border-gray-200 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-brand-bg">
                  <th className="text-left px-5 py-3 text-brand-muted text-[11px] uppercase tracking-wider font-medium">
                    Nombre
                  </th>
                  <th className="text-left px-5 py-3 text-brand-muted text-[11px] uppercase tracking-wider font-medium">
                    Cargo
                  </th>
                  <th className="text-left px-5 py-3 text-brand-muted text-[11px] uppercase tracking-wider font-medium">
                    Empresa
                  </th>
                  <th className="text-left px-5 py-3 text-brand-muted text-[11px] uppercase tracking-wider font-medium">
                    Sector
                  </th>
                  <th className="text-left px-5 py-3 text-brand-muted text-[11px] uppercase tracking-wider font-medium">
                    Registro
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-brand-muted">
                      No hay asistentes que coincidan con la búsqueda
                    </td>
                  </tr>
                ) : (
                  filtered.map((p, i) => (
                    <tr
                      key={p.id}
                      className={`border-b border-gray-50 hover:bg-brand-bg transition-colors ${i % 2 === 0 ? '' : 'bg-gray-50/50'}`}
                    >
                      <td className="px-5 py-3">
                        <div>
                          <p className="text-gray-900 font-medium">{p.nombre || '—'}</p>
                          <p className="text-brand-muted text-[11px]">{p.email}</p>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-gray-700">{p.cargo || '—'}</td>
                      <td className="px-5 py-3 text-gray-700">{p.empresa || '—'}</td>
                      <td className="px-5 py-3">
                        {p.sector ? (
                          <span className="bg-brand-primary/10 text-[#1670A0] text-[11px] font-medium px-2 py-0.5 rounded-full">
                            {p.sector}
                          </span>
                        ) : '—'}
                      </td>
                      <td className="px-5 py-3 text-brand-muted text-[11px]">
                        {p.created_at
                          ? new Date(p.created_at).toLocaleDateString('es-CO', {
                              day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                            })
                          : '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

        </main>
      </div>
    </div>
  )
}

