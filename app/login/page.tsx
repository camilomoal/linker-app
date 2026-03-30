import { Suspense } from 'react'
import LoginClient from './login-client'

export const metadata = {
  title: 'Admin — Linker by 3GOVideo',
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-brand-black flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <LoginClient />
    </Suspense>
  )
}
