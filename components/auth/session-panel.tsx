"use client"

import { useAuthStore } from "@/stores/use-auth-store"

export function SessionPanel() {
  const { user, isLoading, error, refresh, logout } = useAuthStore()
  return (
    <section>
      <h2>Sessiya</h2>
      <p>Email: {user?.email}</p>
      <p>User ID: {user?.id}</p>
      <p>Rol: {user?.role}</p>
      <p>Hisob turi: {user?.accountType}</p>
      {user?.assignedServerId && <p>Server ID: {user.assignedServerId}</p>}
      <button disabled={isLoading} onClick={() => void refresh()}>Sessiyani yangilash</button>
      <button disabled={isLoading} onClick={() => void logout()}>Chiqish</button>
      <button disabled={isLoading} onClick={() => void logout(true)}>Barcha qurilmalardan chiqish</button>
      {isLoading && <p role="status">Kutilmoqda...</p>}
      {error && <p role="alert">{error}</p>}
    </section>
  )
}
