'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Step = 1 | 2 | 3 | 'success' | 'error'

interface FormData {
  full_name: string
  email: string
  cargo: string
  empresa: string
  sector: string
  ciudad: string
  linkedin_url: string
  bio_corta: string
  buscando: string[]
  ofreciendo: string[]
}

const BUSCANDO_OPTIONS = [
  'Clientes potenciales',
  'Aliados estratégicos',
  'Inversionistas',
  'Proveedores',
  'Talento / equipo',
  'Conocimiento técnico',
  'Visibilidad de marca',
  'Mentoría',
]

const OFRECIENDO_OPTIONS = [
  'Servicios / productos',
  'Inversión / capital',
  'Experiencia en el sector',
  'Red de contactos',
  'Tecnología',
  'Mentoría',
  'Oportunidades laborales',
  'Contenido / media',
]

const SECTORES = [
  'Tecnología',
  'Salud',
  'Educación',
  'Fintech',
  'Agroindustria',
  'Energía',
  'Retail / Comercio',
  'Manufactura',
  'Gobierno',
  'Medios / Entretenimiento',
  'Consultoría',
  'Otro',
]

export default function RegistroPage() {
  const supabase = createClient()
  const eventId = process.env.NEXT_PUBLIC_DEFAULT_EVENT_ID || ''

  const [step, setStep] = useState<Step>(1)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const [form, setForm] = useState<FormData>({
    full_name: '',
    email: '',
    cargo: '',
    empresa: '',
    sector: '',
    ciudad: '',
    linkedin_url: '',
    bio_corta: '',
    buscando: [],
    ofreciendo: [],
  })

  const update = (field: keyof FormData, value: string) =>
    setForm(prev => ({ ...prev, [field]: value }))

  const toggleChip = (field: 'buscando' | 'ofreciendo', value: string) => {
    setForm(prev => {
      const arr = prev[field]
      return {
        ...prev,
        [field]: arr.includes(value)
          ? arr.filter(v => v !== value)
          : [...arr, value],
      }
    })
  }

  const isStep1Valid =
    form.full_name.trim() &&
    form.email.trim() &&
    form.cargo.trim() &&
    form.empresa.trim()

  const isStep2Valid = form.sector !== ''

  const handleSubmit = async () => {
    setLoading(true)
    setErrorMsg('')

    try {
      // 1. Insertar perfil
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .insert({
          full_name: form.full_name.trim(),
          email: form.email.trim().toLowerCase(),
          cargo: form.cargo.trim(),
          empresa: form.empresa.trim(),
          sector: form.sector,
          ciudad: form.ciudad.trim() || null,
          linkedin_url: form.linkedin_url.trim() || null,
          bio_corta: form.bio_corta.trim() || null,
          event_id: eventId,
        })
        .select('id')
        .single()

      if (profileError) throw profileError

      // 2. Insertar intereses — una fila por cada tag seleccionado
      const allInterests = [
        ...form.buscando.map(tag => ({
          profile_id: profileData.id,
          interest_tag: tag,
          descripcion: 'buscando',
        })),
        ...form.ofreciendo.map(tag => ({
          profile_id: profileData.id,
          interest_tag: tag,
          descripcion: 'ofreciendo',
        })),
      ]

      if (allInterests.length > 0) {
        const { error: interestsError } = await supabase
          .from('interests')
          .insert(allInterests)
        if (interestsError) console.warn('Interests insert failed:', interestsError)
      }

      setStep('success')
    } catch (err: any) {
      console.error(err)
      if (err?.code === '23505') {
        setErrorMsg('Este email ya está registrado en este evento.')
      } else {
        setErrorMsg('Ocurrió un error. Intenta de nuevo.')
      }
      setStep('error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-brand-black flex flex-col items-center justify-start px-4 py-10">

      <div className="mb-8 text-center">
        <span className="text-2xl font-bold text-brand-primary tracking-tight">Linker</span>
        <p className="text-brand-muted text-sm mt-1">Colombia 5.0 · Santander</p>
      </div>

      <div className="w-full max-w-md bg-brand-surface border border-brand-border rounded-2xl p-6 shadow-xl">

        {step === 'success' && (
          <div className="flex flex-col items-center text-center py-6 gap-4">
            <div className="text-5xl">🎉</div>
            <h2 className="text-xl font-bold text-white">¡Registro exitoso!</h2>
            <p className="text-brand-muted text-sm">
              Tu perfil quedó guardado en Colombia 5.0 Santander.<br />
              Pronto recibirás tus conexiones recomendadas.
            </p>
            <div className="mt-4 w-full bg-brand-surface2 rounded-xl p-4 text-left">
              <p className="text-brand-secondary text-sm font-medium">{form.full_name}</p>
              <p className="text-brand-muted text-xs">{form.cargo} · {form.empresa}</p>
            </div>
          </div>
        )}

        {step === 'error' && (
          <div className="flex flex-col items-center text-center py-6 gap-4">
            <div className="text-5xl">⚠️</div>
            <h2 className="text-xl font-bold text-white">Algo salió mal</h2>
            <p className="text-brand-muted text-sm">{errorMsg}</p>
            <button
              onClick={() => setStep(1)}
              className="mt-4 w-full bg-brand-primary text-white font-semibold py-3 rounded-xl text-sm"
            >
              Intentar de nuevo
            </button>
          </div>
        )}

        {step === 1 && (
          <>
            <StepHeader step={1} total={3} title="¿Quién eres?" />
            <div className="flex flex-col gap-4 mt-6">
              <Field label="Nombre completo *" value={form.full_name}
                onChange={v => update('full_name', v)} placeholder="Ej. Ana Gómez" />
              <Field label="Email *" value={form.email} type="email"
                onChange={v => update('email', v)} placeholder="ana@empresa.com" />
              <Field label="Cargo *" value={form.cargo}
                onChange={v => update('cargo', v)} placeholder="Ej. CEO, CTO, Gerente..." />
              <Field label="Empresa *" value={form.empresa}
                onChange={v => update('empresa', v)} placeholder="Nombre de tu empresa" />
            </div>
            <button
              disabled={!isStep1Valid}
              onClick={() => setStep(2)}
              className="mt-6 w-full bg-brand-primary disabled:bg-brand-border disabled:text-brand-muted text-white font-semibold py-3 rounded-xl text-sm transition-colors"
            >
              Continuar →
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <StepHeader step={2} total={3} title="Tu perfil profesional" />
            <div className="flex flex-col gap-4 mt-6">
              <div>
                <label className="text-brand-muted text-xs font-medium uppercase tracking-wide mb-1.5 block">
                  Sector *
                </label>
                <select
                  value={form.sector}
                  onChange={e => update('sector', e.target.value)}
                  className="w-full bg-brand-surface2 border border-brand-border rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-primary"
                >
                  <option value="">Selecciona un sector</option>
                  {SECTORES.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <Field label="Ciudad" value={form.ciudad}
                onChange={v => update('ciudad', v)} placeholder="Ej. Bucaramanga" />
              <Field label="LinkedIn (opcional)" value={form.linkedin_url}
                onChange={v => update('linkedin_url', v)} placeholder="linkedin.com/in/tu-perfil" />

              <div>
                <label className="text-brand-muted text-xs font-medium uppercase tracking-wide mb-1.5 block">
                  Bio corta (opcional)
                </label>
                <textarea
                  value={form.bio_corta}
                  onChange={e => update('bio_corta', e.target.value)}
                  placeholder="¿Qué haces? ¿En qué eres experto?"
                  rows={3}
                  maxLength={200}
                  className="w-full bg-brand-surface2 border border-brand-border rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-primary resize-none"
                />
                <p className="text-brand-muted text-xs mt-1 text-right">{form.bio_corta.length}/200</p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setStep(1)}
                className="flex-1 border border-brand-border text-brand-muted font-semibold py-3 rounded-xl text-sm"
              >
                ← Atrás
              </button>
              <button
                disabled={!isStep2Valid}
                onClick={() => setStep(3)}
                className="flex-1 bg-brand-primary disabled:bg-brand-border disabled:text-brand-muted text-white font-semibold py-3 rounded-xl text-sm transition-colors"
              >
                Continuar →
              </button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <StepHeader step={3} total={3} title="¿Qué buscas?" />
            <p className="text-brand-muted text-xs mt-1">
              Esto le permite a Linker conectarte con las personas correctas.
            </p>

            <div className="mt-5">
              <p className="text-white text-sm font-semibold mb-3">Estoy buscando…</p>
              <ChipGroup
                options={BUSCANDO_OPTIONS}
                selected={form.buscando}
                onToggle={v => toggleChip('buscando', v)}
              />
            </div>

            <div className="mt-5">
              <p className="text-white text-sm font-semibold mb-3">Puedo ofrecer…</p>
              <ChipGroup
                options={OFRECIENDO_OPTIONS}
                selected={form.ofreciendo}
                onToggle={v => toggleChip('ofreciendo', v)}
              />
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setStep(2)}
                className="flex-1 border border-brand-border text-brand-muted font-semibold py-3 rounded-xl text-sm"
              >
                ← Atrás
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 bg-brand-primary disabled:opacity-60 text-white font-semibold py-3 rounded-xl text-sm transition-colors"
              >
                {loading ? 'Registrando…' : 'Registrarme ✓'}
              </button>
            </div>
          </>
        )}
      </div>

      <p className="text-brand-muted text-xs mt-6 text-center">
        Colombia 5.0 · Powered by Linker
      </p>
    </div>
  )
}

function StepHeader({ step, total, title }: { step: number; total: number; title: string }) {
  return (
    <div>
      <div className="flex gap-1.5 mb-4">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors ${
              i < step ? 'bg-brand-primary' : 'bg-brand-border'
            }`}
          />
        ))}
      </div>
      <p className="text-brand-muted text-xs uppercase tracking-widest font-medium">
        Paso {step} de {total}
      </p>
      <h2 className="text-white text-xl font-bold mt-1">{title}</h2>
    </div>
  )
}

function Field({
  label, value, onChange, placeholder, type = 'text',
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
}) {
  return (
    <div>
      <label className="text-brand-muted text-xs font-medium uppercase tracking-wide mb-1.5 block">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-brand-surface2 border border-brand-border rounded-xl px-4 py-3 text-sm text-white placeholder-brand-muted focus:outline-none focus:border-brand-primary transition-colors"
      />
    </div>
  )
}

function ChipGroup({
  options, selected, onToggle,
}: {
  options: string[]
  selected: string[]
  onToggle: (v: string) => void
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(opt => {
        const active = selected.includes(opt)
        return (
          <button
            key={opt}
            onClick={() => onToggle(opt)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              active
                ? 'bg-brand-primary border-brand-primary text-white'
                : 'bg-brand-surface2 border-brand-border text-brand-muted'
            }`}
          >
            {opt}
          </button>
        )
      })}
    </div>
  )
}
