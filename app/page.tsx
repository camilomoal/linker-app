'use client'
import LinkerApp from '@/components/LinkerApp'

const DEFAULT_EVENT_ID = process.env.NEXT_PUBLIC_DEFAULT_EVENT_ID || 'colombia50-santander-2026'

export default function Home() {
  return <LinkerApp eventId={DEFAULT_EVENT_ID} />
}
