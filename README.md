# Linker — Networking Inteligente

App de networking B2B con matching por IA para eventos presenciales.

## Setup rápido

1. Corre el SQL en Supabase: copia `supabase-schema.sql` en Supabase > SQL Editor > Run
2. Agrega variables de entorno en Vercel (ver abajo)
3. Deploy automático desde GitHub

## Variables de entorno en Vercel

En Vercel > tu proyecto > Settings > Environment Variables:

```
NEXT_PUBLIC_SUPABASE_URL = https://wrmauhapeckyoxtvgheh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = sb_publishable_-k0qPRVdD75tpO4HZcEsFQ_beE-iLJw
ANTHROPIC_API_KEY = (tu API key de console.anthropic.com)
NEXT_PUBLIC_DEFAULT_EVENT_ID = colombia50-santander-2026
```

## Stack

- Next.js 14 + TypeScript
- Supabase (PostgreSQL + Realtime + Storage)
- Anthropic Claude API (matching inteligente)
- Vercel (hosting)
