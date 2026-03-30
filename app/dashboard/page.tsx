import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DashboardClient from './dashboard-client'

export default async function DashboardPage() {
  const supabase = createClient()

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    redirect('/login')
  }

  const { data: profiles } = await supabase
    .from('profiles')
    .select(`
      id,
      full_name,
      email,
      company,
      role,
      sector,
      city,
      created_at,
      interests (
        topic,
        event_id
      ),
      event_history (
        event_id,
        attended,
        role_at_event
      )
    `)
    .order('created_at', { ascending: false })

  const totalCount = profiles?.length ?? 0

  const mappedProfiles =
    (profiles || []).map((p) => ({
      id: p.id,
      nombre: p.full_name,
      email: p.email,
      cargo: p.role,
      empresa: p.company,
      sector: p.sector,
      created_at: p.created_at,
    }))

  return <DashboardClient profiles={mappedProfiles} totalCount={totalCount} />
}
