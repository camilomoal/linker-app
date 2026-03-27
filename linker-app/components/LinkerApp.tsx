'use client'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import type { Profile, Event } from '@/lib/supabase'

// ─── COLORS ──────────────────────────────────────────────────────────────────
const C = {
  bg:'#0d0820',surface:'#160d2e',card:'#1e1040',border:'#2e1f60',
  purple:'#7c3aed',purpleHi:'#9d5cf5',purpleDim:'#7c3aed18',
  green:'#00e676',greenHi:'#69ff99',greenDim:'#00e67618',
  text:'#f5f0ff',muted:'#9980cc',danger:'#ff4466',success:'#00cc88',
}

function compressImage(file: File, maxSize = 320): Promise<string> {
  return new Promise((res) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ratio = Math.min(maxSize / img.width, maxSize / img.height, 1)
      canvas.width = Math.round(img.width * ratio)
      canvas.height = Math.round(img.height * ratio)
      canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height)
      URL.revokeObjectURL(url)
      res(canvas.toDataURL('image/jpeg', 0.78))
    }
    img.onerror = () => res('')
    img.src = url
  })
}

async function uploadPhoto(base64: string, profileId: string): Promise<string> {
  const base64Data = base64.replace(/^data:image\/\w+;base64,/, '')
  const buffer = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0))
  const path = `photos/${profileId}.jpg`
  const { error } = await supabase.storage.from('linker-photos').upload(path, buffer, {
    contentType: 'image/jpeg', upsert: true,
  })
  if (error) return ''
  const { data } = supabase.storage.from('linker-photos').getPublicUrl(path)
  return data.publicUrl
}

async function getAIMatches(myProfile: Profile, others: Profile[]) {
  if (!others.length) return []
  const prompt = `Motor de matching B2B para eventos de networking.
Mi perfil: ${myProfile.name} | ${myProfile.company} — ${myProfile.role} | Ofrezco: ${myProfile.offer} | Busco: ${myProfile.seeking}
Perfiles:
${others.map((p,i) => `[${i}] ${p.name} (${p.company}, ${p.role}) | Ofrece: ${p.offer} | Busca: ${p.seeking}`).join('\n')}
Devuelve SOLO JSON top ${Math.min(5, others.length)} matches:
[{"index":0,"score":95,"reason":"por qué conectan máx 18 palabras","message":"mensaje intro primera persona máx 28 palabras","opportunity":"tipo oportunidad 4 palabras"}]`
  try {
    const res = await fetch('/api/match', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    })
    const data = await res.json()
    return (data.matches || []).map((m: any) => ({ ...m, profile: others[m.index] })).filter((m: any) => m.profile)
  } catch { return [] }
}

const css = `
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
*{box-sizing:border-box;margin:0;padding:0;}
.app{font-family:'Outfit',sans-serif;background:#0d0820;color:#f5f0ff;min-height:100vh;max-width:430px;margin:0 auto;position:relative;}
.grid-bg{position:fixed;inset:0;background-image:linear-gradient(#2e1f6033 1px,transparent 1px),linear-gradient(90deg,#2e1f6033 1px,transparent 1px);background-size:40px 40px;pointer-events:none;z-index:0;}
.screen{min-height:100vh;display:flex;flex-direction:column;padding:28px 20px 40px;position:relative;z-index:1;animation:up .35s ease;}
@keyframes up{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
.logo-event{display:inline-flex;align-items:center;gap:6px;background:#7c3aed18;border:1px solid #7c3aed55;border-radius:8px;padding:4px 12px;font-size:11px;font-weight:700;color:#00e676;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:10px;}
.logo-main{font-size:38px;font-weight:800;line-height:1;color:#f5f0ff;}
.logo-main span{color:#00e676;}
.logo-sub{font-size:12px;color:#9980cc;margin-top:4px;}
.hl{font-size:22px;font-weight:800;line-height:1.3;margin:18px 0 8px;}
.sub{font-size:14px;color:#9980cc;line-height:1.65;}
.card{background:#1e1040;border:1px solid #2e1f60;border-radius:14px;padding:18px;margin-bottom:12px;}
.card-on{border-color:#00e67644;}
.lbl{font-size:10px;font-weight:700;letter-spacing:1.8px;text-transform:uppercase;color:#9980cc;margin-bottom:7px;display:block;}
.inp{width:100%;background:#160d2e;border:1.5px solid #2e1f60;border-radius:10px;padding:12px 14px;font-size:15px;font-family:'Outfit',sans-serif;color:#f5f0ff;outline:none;transition:border .2s;}
.inp::placeholder{color:#9980cc;}
.inp:focus{border-color:#00e676;}
.ta{resize:none;min-height:78px;line-height:1.55;}
.btn{width:100%;background:#00e676;color:#0d0820;border:none;border-radius:12px;padding:16px;font-size:16px;font-weight:800;font-family:'Outfit',sans-serif;cursor:pointer;transition:all .2s;}
.btn:hover{background:#69ff99;transform:translateY(-1px);}
.btn:disabled{opacity:.35;cursor:not-allowed;transform:none;}
.btn-out{background:transparent;color:#00e676;border:1.5px solid #00e67644;}
.btn-out:hover{background:#00e67618;}
.btn-p{background:#7c3aed;color:#fff;}
.btn-p:hover{background:#9d5cf5;}
.btn-danger{background:transparent;color:#ff4466;border:1.5px solid #ff446644;}
.consent{display:flex;gap:10px;align-items:flex-start;}
.consent input{width:18px;height:18px;min-width:18px;accent-color:#00e676;cursor:pointer;margin-top:3px;}
.ct{font-size:12px;color:#9980cc;line-height:1.65;}
.ct a{color:#00e676;text-decoration:none;}
.dots{display:flex;gap:6px;margin-bottom:22px;}
.dot{width:6px;height:6px;border-radius:3px;background:#2e1f60;transition:all .3s;}
.dot.on{width:22px;background:#00e676;}
.mc{background:#1e1040;border:1px solid #2e1f60;border-radius:14px;padding:16px;margin-bottom:10px;cursor:pointer;transition:border .2s;}
.mc:hover{border-color:#7c3aed66;}
.mc-h{display:flex;align-items:center;gap:12px;margin-bottom:10px;}
.mc-av{width:50px;height:50px;background:#160d2e;border-radius:12px;display:flex;align-items:center;justify-content:center;flex-shrink:0;border:1px solid #2e1f60;overflow:hidden;}
.mc-n{font-size:15px;font-weight:700;}
.mc-r{font-size:11px;color:#9980cc;margin-top:2px;}
.sbar{height:3px;background:#2e1f60;border-radius:2px;margin:8px 0;overflow:hidden;}
.sfill{height:100%;border-radius:2px;background:linear-gradient(90deg,#00e676,#7c3aed);transition:width 1.2s ease;}
.sc{font-family:'JetBrains Mono',monospace;font-size:13px;color:#00e676;font-weight:500;}
.tag-g{display:inline-flex;align-items:center;background:#00e67618;border:1px solid #00e67644;color:#00e676;border-radius:20px;padding:2px 9px;font-size:10px;font-weight:700;}
.reason{background:#160d2e;border-radius:9px;padding:10px 12px;font-size:13px;color:#9980cc;line-height:1.55;margin-bottom:8px;}
.reason strong{color:#f5f0ff;}
.msg{background:#00e67618;border:1px solid #00e67633;border-radius:9px;padding:10px 12px;font-size:13px;color:#00e676;line-height:1.5;font-style:italic;}
.opp{display:inline-flex;align-items:center;gap:4px;background:#7c3aed18;border:1px solid #7c3aed33;border-radius:20px;padding:3px 10px;font-size:11px;color:#c4a0ff;font-weight:600;margin-bottom:8px;}
.sr{display:flex;gap:10px;margin-bottom:14px;}
.st{flex:1;background:#1e1040;border:1px solid #2e1f60;border-radius:12px;padding:14px 10px;text-align:center;}
.sv{font-size:26px;font-weight:800;color:#00e676;font-family:'JetBrains Mono',monospace;}
.sl{font-size:10px;color:#9980cc;margin-top:3px;font-weight:600;letter-spacing:.5px;text-transform:uppercase;}
.div{height:1px;background:#2e1f60;margin:18px 0;}
.chips{display:flex;flex-wrap:wrap;gap:8px;margin:14px 0;}
.chip{display:inline-flex;align-items:center;gap:5px;background:#160d2e;border:1px solid #2e1f60;border-radius:8px;padding:5px 10px;font-size:12px;color:#9980cc;}
.spinner{width:38px;height:38px;border:3px solid #2e1f60;border-top-color:#00e676;border-radius:50%;animation:spin .75s linear infinite;margin:0 auto;}
@keyframes spin{to{transform:rotate(360deg)}}
.pulse{animation:pulse 2s infinite;}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.55}}
.empty{text-align:center;padding:40px 20px;color:#9980cc;}
.contact-link{font-size:12px;display:flex;align-items:center;gap:6px;text-decoration:none;padding:4px 0;}
`

// ─── WELCOME ─────────────────────────────────────────────────────────────────
function Welcome({ event, onStart }: { event: Event | null, onStart: () => void }) {
  const [ok, setOk] = useState(false)
  const isLive = event?.status === 'live'
  const isClosed = event?.status === 'closed'

  return (
    <div className="screen" style={{ justifyContent: 'space-between' }}>
      <div>
        <div style={{ marginBottom: 28, marginTop: 8 }}>
          <div className="logo-event">⚡ {event?.name || 'Linker Event'}</div>
          <div className="logo-main">Link<span>er</span></div>
          <div className="logo-sub">Networking inteligente · Powered by IA</div>
        </div>
        {isClosed ? (
          <div className="card" style={{ textAlign: 'center', padding: 32 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🎉</div>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>Evento finalizado</div>
            <div style={{ fontSize: 13, color: C.muted }}>Gracias por usar Linker. Las conexiones generadas en este evento fueron increíbles.</div>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 13, color: C.green, fontWeight: 700, letterSpacing: 1, marginBottom: 6 }}>NETWORKING INTELIGENTE</div>
              <div className="hl">Conecta con quien<br />realmente importa</div>
              <div className="sub">La IA analiza tu perfil y encuentra las oportunidades de negocio más valiosas para ti en este evento.</div>
            </div>
            <div className="chips">
              {['⚡ Match en 60s', '🔒 ABEAS Data', '🤝 Conexiones reales', '📊 ROI medible'].map(t => (
                <div key={t} className="chip">{t}</div>
              ))}
            </div>
            {isLive && (
              <div className="card" style={{ borderColor: C.green + '44', background: C.greenDim }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: C.green, animation: 'pulse 1.5s infinite' }} />
                  <div style={{ fontWeight: 700, color: C.green, fontSize: 13 }}>Evento en vivo — Matching activo</div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {!isClosed && (
        <div>
          <div className="card" style={{ marginBottom: 14 }}>
            <div className="consent">
              <input type="checkbox" id="cb" checked={ok} onChange={e => setOk(e.target.checked)} />
              <label htmlFor="cb" className="ct">
                Autorizo el tratamiento de mis datos según la <a href="#">Ley 1581/2012 (ABEAS Data)</a> y la política de privacidad de {event?.organizer || 'el organizador'}. Datos usados exclusivamente para conectar oportunidades de negocio en este evento.
              </label>
            </div>
          </div>
          <button className="btn" disabled={!ok} onClick={onStart}>Crear mi perfil →</button>
          <div style={{ textAlign: 'center', marginTop: 10, fontSize: 11, color: C.muted }}>
            Datos protegidos · Cifrados en tránsito y reposo
          </div>
        </div>
      )}
    </div>
  )
}

// ─── PROFILE ─────────────────────────────────────────────────────────────────
function ProfileForm({ existing, eventId, onSave }: { existing: Profile | null, eventId: string, onSave: (p: Profile) => void }) {
  const [f, setF] = useState({
    name: existing?.name || '', company: existing?.company || '',
    role: existing?.role || '', offer: existing?.offer || '',
    seeking: existing?.seeking || '', email: existing?.email || '',
    phone: existing?.phone || '', linkedin: existing?.linkedin || '',
    instagram: existing?.instagram || '', tiktok: existing?.tiktok || '',
    other: existing?.other || '', photoPreview: existing?.photo_url || '',
    photoFile: null as File | null,
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const u = (k: string, v: any) => setF(p => ({ ...p, [k]: v }))
  const step = [f.name && f.company, f.offer, f.seeking].filter(Boolean).length
  const valid = f.name && f.company && f.role && f.offer && f.seeking && f.email

  const submit = async () => {
    setSaving(true)
    setError('')
    try {
      let photoUrl = existing?.photo_url || ''
      const profileId = existing?.id || crypto.randomUUID()

      if (f.photoFile) {
        const compressed = await compressImage(f.photoFile)
        if (compressed) {
          const uploaded = await uploadPhoto(compressed, profileId)
          if (uploaded) photoUrl = uploaded
        }
      }

      const profileData = {
        id: profileId, event_id: eventId,
        name: f.name, company: f.company, role: f.role,
        offer: f.offer, seeking: f.seeking, email: f.email,
        phone: f.phone || null, linkedin: f.linkedin || null,
        instagram: f.instagram || null, tiktok: f.tiktok || null,
        other: f.other || null, photo_url: photoUrl || null, consent: true,
      }

      const { data, error: err } = await supabase
        .from('profiles').upsert(profileData).select().single()

      if (err) throw err
      localStorage.setItem('linker_profile_id', data.id)
      onSave(data)
    } catch (e: any) {
      setError(e.message || 'Error guardando perfil')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="screen">
      <div className="dots">{[0, 1, 2].map(i => <div key={i} className={`dot ${i < step ? 'on' : ''}`} />)}</div>
      <div style={{ marginBottom: 22 }}>
        <div style={{ fontSize: 12, color: C.green, fontWeight: 700, letterSpacing: 1.5, marginBottom: 4 }}>TU PERFIL</div>
        <div className="hl" style={{ fontSize: 20 }}>Cuéntanos quién eres</div>
        <div className="sub">60 segundos para conectar con las personas correctas</div>
      </div>

      {/* FOTO */}
      <div className="card" style={{ textAlign: 'center' }}>
        <span className="lbl" style={{ textAlign: 'left', display: 'block' }}>📷 Tu foto</span>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 100, height: 100, borderRadius: '50%', overflow: 'hidden',
            background: C.surface, border: `2px dashed ${f.photoPreview ? C.green : C.border}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          }} onClick={() => document.getElementById('photo-inp')!.click()}>
            {f.photoPreview
              ? <img src={f.photoPreview} alt="foto" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <div style={{ textAlign: 'center' }}><div style={{ fontSize: 28 }}>📷</div><div style={{ fontSize: 10, color: C.muted, marginTop: 4 }}>Subir foto</div></div>
            }
          </div>
          <input id="photo-inp" type="file" accept="image/*" capture="user" style={{ display: 'none' }}
            onChange={async e => {
              const file = e.target.files?.[0]
              if (!file) return
              u('photoFile', file)
              const preview = URL.createObjectURL(file)
              u('photoPreview', preview)
            }} />
          <button type="button" className="btn btn-out" style={{ width: 'auto', padding: '8px 16px', fontSize: 13 }}
            onClick={() => document.getElementById('photo-inp')!.click()}>
            {f.photoPreview ? 'Cambiar foto' : 'Subir foto'}
          </button>
          <div style={{ fontSize: 11, color: f.photoPreview ? C.green : C.muted }}>
            {f.photoPreview ? '✓ Foto lista — tus matches te reconocerán' : 'Recomendado: sube tu foto real'}
          </div>
        </div>
      </div>

      <div className="card">
        <span className="lbl">Nombre completo *</span>
        <input className="inp" placeholder="ej. Camilo Montañez" value={f.name} onChange={e => u('name', e.target.value)} />
      </div>

      <div className="card">
        <span className="lbl">Empresa *</span>
        <input className="inp" placeholder="ej. 3GOVideo" value={f.company} onChange={e => u('company', e.target.value)} style={{ marginBottom: 10 }} />
        <span className="lbl">Rol *</span>
        <input className="inp" placeholder="ej. CEO / Fundador" value={f.role} onChange={e => u('role', e.target.value)} />
      </div>

      <div className={`card ${f.offer ? 'card-on' : ''}`}>
        <span className="lbl">🚀 ¿Qué ofrezco? *</span>
        <textarea className="inp ta" placeholder="ej. Asistentes de IA con apariencia humana. Capacitación VR para empresas." value={f.offer} onChange={e => u('offer', e.target.value)} />
      </div>

      <div className={`card ${f.seeking ? 'card-on' : ''}`}>
        <span className="lbl">🎯 ¿Qué busco? *</span>
        <textarea className="inp ta" placeholder="ej. Aliados en salud y retail. Inversión para escalar." value={f.seeking} onChange={e => u('seeking', e.target.value)} />
      </div>

      <div className="card">
        <span className="lbl">📬 Contacto *</span>
        <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10, color: C.muted, marginBottom: 4, letterSpacing: 1, textTransform: 'uppercase', fontWeight: 700 }}>Email *</div>
            <input className="inp" type="email" placeholder="tu@empresa.com" value={f.email} onChange={e => u('email', e.target.value)} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10, color: C.muted, marginBottom: 4, letterSpacing: 1, textTransform: 'uppercase', fontWeight: 700 }}>Celular</div>
            <input className="inp" type="tel" placeholder="+57 300..." value={f.phone} onChange={e => u('phone', e.target.value)} />
          </div>
        </div>
      </div>

      <div className="card">
        <span className="lbl">🔗 Redes sociales</span>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {[
            { k: 'linkedin', icon: '💼', ph: 'linkedin.com/in/...' },
            { k: 'instagram', icon: '📸', ph: '@usuario' },
            { k: 'tiktok', icon: '🎵', ph: '@usuario' },
            { k: 'other', icon: '🌐', ph: 'Sitio web / otra red' },
          ].map(({ k, icon, ph }) => (
            <div key={k}>
              <div style={{ fontSize: 10, color: C.muted, marginBottom: 4, letterSpacing: 1, textTransform: 'uppercase', fontWeight: 700 }}>{icon} {k}</div>
              <input className="inp" placeholder={ph} value={(f as any)[k]} onChange={e => u(k, e.target.value)} style={{ fontSize: 13, padding: '9px 12px' }} />
            </div>
          ))}
        </div>
      </div>

      {error && <div style={{ color: C.danger, fontSize: 13, marginBottom: 10, textAlign: 'center' }}>{error}</div>}
      <button className="btn" style={{ marginTop: 8 }} disabled={!valid || saving} onClick={submit}>
        {saving ? 'Guardando...' : 'Ver mis matches →'}
      </button>
    </div>
  )
}

// ─── MATCHING ────────────────────────────────────────────────────────────────
function Matching({ profile, event, onDone }: { profile: Profile, event: Event | null, onDone: (m: any[], ps: Profile[]) => void }) {
  const [matches, setMatches] = useState<any[] | null>(null)
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [status, setStatus] = useState('Cargando asistentes...')

  useEffect(() => {
    if (event?.status === 'registration') {
      setStatus('El evento aún no ha comenzado. El organizador activará el matching pronto.')
      setMatches([])
      return
    }
    ;(async () => {
      const { data } = await supabase.from('profiles').select('*').eq('event_id', profile.event_id)
      const all = data || []
      setProfiles(all)
      const others = all.filter(p => p.id !== profile.id)
      if (!others.length) { setMatches([]); return }
      setStatus(`Analizando ${others.length} asistentes con IA...`)
      const m = await getAIMatches(profile, others)
      setMatches(m)
    })()
  }, [])

  if (!matches) return (
    <div className="screen" style={{ justifyContent: 'center', alignItems: 'center', gap: 24 }}>
      <div style={{ fontSize: 48 }}>⚡</div>
      <div className="spinner" />
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontWeight: 700, marginBottom: 6 }}>Analizando con IA</div>
        <div style={{ fontSize: 13, color: C.muted }} className="pulse">{status}</div>
      </div>
    </div>
  )

  const waitingMode = event?.status === 'registration'

  return (
    <div className="screen">
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 12, color: C.green, fontWeight: 700, letterSpacing: 1.5, marginBottom: 4 }}>
          {waitingMode ? 'EN ESPERA' : 'TUS MATCHES'}
        </div>
        <div className="hl" style={{ fontSize: 20 }}>
          {waitingMode ? 'Registro completado ✓' : matches.length > 0 ? `${matches.length} conexiones de valor` : 'Sé el primero'}
        </div>
        <div className="sub">{profiles.length} asistentes registrados</div>
      </div>

      {waitingMode ? (
        <div className="card" style={{ textAlign: 'center', padding: 32 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>⏳</div>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Tu perfil está listo</div>
          <div style={{ fontSize: 13, color: C.muted, marginBottom: 16 }}>El organizador activará el matching cuando comience el evento. Te llegará una notificación.</div>
          <div style={{ fontSize: 11, color: C.green }}>Ya hay {profiles.length} persona{profiles.length !== 1 ? 's' : ''} registrada{profiles.length !== 1 ? 's' : ''}</div>
        </div>
      ) : matches.length === 0 ? (
        <div className="empty">
          <div style={{ fontSize: 44, marginBottom: 12 }}>🌱</div>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Sé de los primeros</div>
          <div style={{ fontSize: 13 }}>Cuando más personas se registren verás tus mejores conexiones aquí.</div>
          <button className="btn btn-out" style={{ marginTop: 20 }} onClick={() => window.location.reload()}>Actualizar</button>
        </div>
      ) : (
        <>
          {matches.map((m: any, i: number) => <MatchCard key={m.profile.id} match={m} rank={i + 1} />)}
          <div className="div" />
          <button className="btn btn-out" onClick={() => onDone(matches, profiles)}>Ver mi resumen →</button>
        </>
      )}
    </div>
  )
}

function MatchCard({ match, rank }: { match: any, rank: number }) {
  const [open, setOpen] = useState(rank === 1)
  const [copied, setCopied] = useState(false)
  const copy = () => { navigator.clipboard?.writeText(match.message); setCopied(true); setTimeout(() => setCopied(false), 2000) }

  return (
    <div className="mc" onClick={() => setOpen(o => !o)}>
      <div className="mc-h">
        <div className="mc-av">
          {match.profile.photo_url
            ? <img src={match.profile.photo_url} alt={match.profile.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <span style={{ fontSize: 26 }}>🧑‍💼</span>}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <div className="mc-n">{match.profile.name}</div>
            {rank === 1 && <span className="tag-g">⭐ Top match</span>}
          </div>
          <div className="mc-r">{match.profile.role} · {match.profile.company}</div>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div className="sc">{match.score}%</div>
          <div style={{ fontSize: 10, color: C.muted }}>afinidad</div>
        </div>
      </div>
      <div className="sbar"><div className="sfill" style={{ width: `${match.score}%` }} /></div>
      {match.opportunity && <div className="opp">💼 {match.opportunity}</div>}
      {open && (
        <div>
          <div className="reason"><strong>¿Por qué conectan? </strong>{match.reason}</div>
          <div style={{ fontSize: 10, color: C.muted, fontWeight: 700, letterSpacing: 1.5, marginBottom: 6, textTransform: 'uppercase' }}>Mensaje sugerido</div>
          <div className="msg">"{match.message}"</div>
          <button className="btn" style={{ marginTop: 10, fontSize: 13, padding: '10px', background: copied ? C.success : C.green }}
            onClick={e => { e.stopPropagation(); copy() }}>
            {copied ? '✓ Copiado' : 'Copiar mensaje'}
          </button>
          <div style={{ marginTop: 12, padding: 12, background: C.surface, borderRadius: 10, border: `1px solid ${C.border}` }}>
            <div style={{ fontSize: 10, color: C.muted, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 8 }}>Contacto</div>
            {match.profile.email && <a href={`mailto:${match.profile.email}`} className="contact-link" style={{ color: C.green }}
              onClick={e => e.stopPropagation()}>📬 {match.profile.email}</a>}
            {match.profile.phone && <a href={`tel:${match.profile.phone}`} className="contact-link" style={{ color: C.muted }}
              onClick={e => e.stopPropagation()}>📱 {match.profile.phone}</a>}
            {match.profile.linkedin && <a href={match.profile.linkedin.startsWith('http') ? match.profile.linkedin : `https://${match.profile.linkedin}`}
              target="_blank" rel="noreferrer" className="contact-link" style={{ color: '#60a5fa' }}
              onClick={e => e.stopPropagation()}>💼 {match.profile.linkedin}</a>}
            {match.profile.instagram && <span className="contact-link" style={{ color: C.muted }}>📸 {match.profile.instagram}</span>}
            {match.profile.tiktok && <span className="contact-link" style={{ color: C.muted }}>🎵 {match.profile.tiktok}</span>}
            {match.profile.other && <a href={match.profile.other.startsWith('http') ? match.profile.other : `https://${match.profile.other}`}
              target="_blank" rel="noreferrer" className="contact-link" style={{ color: C.muted }}
              onClick={e => e.stopPropagation()}>🌐 {match.profile.other}</a>}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── SUMMARY ─────────────────────────────────────────────────────────────────
function Summary({ profile, matches, profiles, onEdit, onRefresh }: { profile: Profile, matches: any[], profiles: Profile[], onEdit: () => void, onRefresh: () => void }) {
  const avg = matches.length ? Math.round(matches.reduce((a, m) => a + m.score, 0) / matches.length) : 0
  return (
    <div className="screen">
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 12, color: C.green, fontWeight: 700, letterSpacing: 1.5, marginBottom: 4 }}>RESUMEN</div>
        <div className="hl" style={{ fontSize: 20 }}>Tu sesión en el evento</div>
      </div>
      <div className="sr">
        <div className="st"><div className="sv">{matches.length}</div><div className="sl">Matches</div></div>
        <div className="st"><div className="sv">{avg}%</div><div className="sl">Afinidad</div></div>
        <div className="st"><div className="sv">{profiles.length}</div><div className="sl">Asistentes</div></div>
      </div>
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, background: C.surface, border: `2px solid ${C.green}44` }}>
            {profile.photo_url
              ? <img src={profile.photo_url} alt={profile.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>🧑‍💼</div>}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16 }}>{profile.name}</div>
            <div style={{ fontSize: 12, color: C.muted }}>{profile.role} · {profile.company}</div>
          </div>
        </div>
        <div className="div" />
        <div style={{ fontSize: 11, color: C.muted, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 }}>Ofrezco</div>
        <div style={{ fontSize: 13, marginBottom: 12 }}>{profile.offer}</div>
        <div style={{ fontSize: 11, color: C.muted, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 }}>Busco</div>
        <div style={{ fontSize: 13 }}>{profile.seeking}</div>
        {(profile.email || profile.linkedin) && (
          <>
            <div className="div" />
            <div style={{ fontSize: 11, color: C.muted, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>Mi contacto</div>
            {profile.email && <div style={{ fontSize: 12, color: C.green, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>📬 {profile.email}</div>}
            {profile.phone && <div style={{ fontSize: 12, color: C.muted, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>📱 {profile.phone}</div>}
            {profile.linkedin && <div style={{ fontSize: 12, color: '#60a5fa', display: 'flex', alignItems: 'center', gap: 6 }}>💼 {profile.linkedin}</div>}
          </>
        )}
      </div>
      {matches.length > 0 && (
        <div className="card">
          <div style={{ fontSize: 11, color: C.muted, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 12 }}>Top conexiones</div>
          {matches.slice(0, 3).map(m => (
            <div key={m.profile.id} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, background: C.surface }}>
                {m.profile.photo_url
                  ? <img src={m.profile.photo_url} alt={m.profile.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🧑‍💼</div>}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{m.profile.name}</div>
                <div style={{ fontSize: 11, color: C.muted }}>{m.profile.company}</div>
              </div>
              <div className="sc" style={{ fontSize: 12 }}>{m.score}%</div>
            </div>
          ))}
        </div>
      )}
      <button className="btn btn-out" style={{ marginBottom: 10 }} onClick={onRefresh}>Actualizar matches</button>
      <button className="btn btn-p" onClick={onEdit}>Editar mi perfil</button>
    </div>
  )
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function LinkerApp({ eventId }: { eventId: string }) {
  const [screen, setScreen] = useState<'loading' | 'welcome' | 'profile' | 'matching' | 'summary'>('loading')
  const [event, setEvent] = useState<Event | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [matches, setMatches] = useState<any[]>([])
  const [allProfiles, setAllProfiles] = useState<Profile[]>([])

  useEffect(() => {
    ;(async () => {
      const { data: ev } = await supabase.from('events').select('*').eq('id', eventId).single()
      if (ev) setEvent(ev)

      const savedId = localStorage.getItem('linker_profile_id')
      if (savedId) {
        const { data: p } = await supabase.from('profiles').select('*').eq('id', savedId).single()
        if (p && p.event_id === eventId) { setProfile(p); setScreen('summary'); return }
      }
      setScreen('welcome')
    })()
  }, [eventId])

  // Realtime: update event status
  useEffect(() => {
    const ch = supabase.channel('event-status')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'events', filter: `id=eq.${eventId}` },
        payload => setEvent(payload.new as Event))
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [eventId])

  if (screen === 'loading') return (
    <>
      <style>{css}</style>
      <div className="app"><div className="screen" style={{ justifyContent: 'center', alignItems: 'center' }}><div className="spinner" /></div></div>
    </>
  )

  return (
    <>
      <style>{css}</style>
      <div className="app">
        <div className="grid-bg" />
        {screen === 'welcome' && <Welcome event={event} onStart={() => setScreen('profile')} />}
        {screen === 'profile' && (
          <ProfileForm existing={profile} eventId={eventId} onSave={p => { setProfile(p); setScreen('matching') }} />
        )}
        {screen === 'matching' && profile && (
          <Matching profile={profile} event={event} onDone={(m, ps) => { setMatches(m); setAllProfiles(ps); setScreen('summary') }} />
        )}
        {screen === 'summary' && profile && (
          <Summary profile={profile} matches={matches} profiles={allProfiles}
            onEdit={() => setScreen('profile')} onRefresh={() => setScreen('matching')} />
        )}
      </div>
    </>
  )
}
