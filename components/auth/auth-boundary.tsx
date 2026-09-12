"use client"

import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import type { ReactNode } from "react"
import { authHome } from "@/lib/auth-route"
import { useAuthStore } from "@/stores/use-auth-store"

export function AuthBoundary({ children, guest = false }: { children: ReactNode; guest?: boolean }) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, isAuthenticated, isInitialized, initialize } = useAuthStore()
  const home = authHome(user)
  const wrongServer = Boolean(user?.defaultServerId) && pathname !== home && !pathname.startsWith(`${home}/`)
  const redirect = isInitialized && (
    guest ? (isAuthenticated ? home : null) : (!isAuthenticated ? "/login" : wrongServer ? home : null)
  )

  useEffect(() => { void initialize() }, [initialize])
  useEffect(() => { if (redirect) router.replace(redirect) }, [redirect, router])

  if (!isInitialized || redirect) return <p>Yuklanmoqda...</p>
  return children
}
