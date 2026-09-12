"use client"

import { useUserStore } from "@/stores/use-user-store"

export function UserFeedback() {
  const { isLoading, error, message } = useUserStore()
  return <>
    {isLoading && <p role="status">Kutilmoqda...</p>}
    {error && <p role="alert">{error}</p>}
    {message && <p role="status">{message}</p>}
  </>
}
