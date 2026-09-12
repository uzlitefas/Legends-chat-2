"use client"

import { useAuthStore } from "@/stores/use-auth-store"
import Link from "next/link"
import { authHome } from "@/lib/auth-route"

export function SessionPanel() {
  const { user, isLoading, error, refresh, logout } = useAuthStore()
  return (
    <section>
      <h2>Sessiya</h2>
      <nav>
        <Link href={authHome(user)}>Bosh sahifa</Link>{" "}
        <Link href="/profile">Profilim</Link>{" "}
        <Link href="/users">Foydalanuvchi profili</Link>{" "}
        {user?.accountType === "REGULAR" && user.role === "SUPER_ADMIN" && (
          <Link href="/users/settings">User sozlamalari va premium</Link>
        )}
      </nav>
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
