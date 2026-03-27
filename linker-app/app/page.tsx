import LinkerApp from '@/components/LinkerApp'

// Default event ID - replace with your Colombia 5.0 event ID from Supabase
const DEFAULT_EVENT_ID = process.env.NEXT_PUBLIC_DEFAULT_EVENT_ID || 'colombia50-santander-2026'

export default function Home() {
  return <LinkerApp eventId={DEFAULT_EVENT_ID} />
}
