import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DashboardClient from './dashboard-client'

export default async function DashboardPage() {
  const supabase = createClient()

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    redirect('/login')
  }

  const { data: event } = await supabase
    .from('events')
    .select('*')
    .eq('slug', 'colombia-5-0-santander-2025')
    .single()

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

  const { count: matchesCount } = await supabase
    .from('matches')
    .select('*', { count: 'exact', head: true })

  return (
    <DashboardClient
      event={event}
      profiles={profiles || []}
      matchesCount={matchesCount || 0}
      adminEmail={session.user.email || ''}
    />
  )
}
