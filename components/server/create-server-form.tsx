"use client"

import Link from "next/link"
import type { FormEvent } from "react"
import { useAuthStore } from "@/stores/use-auth-store"
import { useServerStore } from "@/stores/use-server-store"

export function CreateServerForm() {
  const { user, accessToken } = useAuthStore()
  const { createServer, createdServer, isSaving, saveError } = useServerStore()

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!user || !accessToken) return
    const form = event.currentTarget
    const data = new FormData(form)
    if (await createServer({
      name: String(data.get("name") ?? "").trim(),
      ownerId: String(data.get("ownerId") ?? "").trim(),
    }, accessToken, user.id)) form.reset()
  }

  if (user?.accountType !== "REGULAR" || user.role !== "SUPER_ADMIN") return null
  return <section>
    <h2>Server yaratish</h2>
    <form onSubmit={submit}>
      <fieldset disabled={isSaving}>
        <div><label htmlFor="server-name">Server nomi</label>
          <input id="server-name" name="name" required maxLength={100} /></div>
        <div><label htmlFor="server-owner">Egasining User ID qiymati</label>
          <input id="server-owner" name="ownerId" required maxLength={64} /></div>
        <button type="submit">{isSaving ? "Yaratilmoqda..." : "Yaratish"}</button>
      </fieldset>
    </form>
    <p>Tanlangan foydalanuvchi server egasi bo‘ladi. Yaratuvchi alohida a’zo sifatida qo‘shilmaydi.</p>
    {saveError && <p role="alert">{saveError}</p>}
    {createdServer && <div role="status">
      <p>Server yaratildi: {createdServer.name}</p>
      <p>Server ID: {createdServer.id}</p>
      <p>Ega ID: {createdServer.ownerId}</p>
      {createdServer.ownerId === user.id && (
        <Link href={`/servers/${encodeURIComponent(createdServer.id)}`}>Serverni ochish</Link>
      )}
    </div>}
  </section>
}
