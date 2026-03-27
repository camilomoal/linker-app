import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Profile = {
  id: string
  event_id: string
  name: string
  company: string
  role: string
  offer: string
  seeking: string
  email: string
  phone?: string
  linkedin?: string
  instagram?: string
  tiktok?: string
  other?: string
  photo_url?: string
  consent: boolean
  created_at: string
}

export type Event = {
  id: string
  name: string
  organizer: string
  status: 'registration' | 'live' | 'closed'
  password: string
  created_at: string
}
