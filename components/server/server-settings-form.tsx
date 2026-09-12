"use client"

import type { FormEvent } from "react"
import { useAuthStore } from "@/stores/use-auth-store"
import { useServerStore } from "@/stores/use-server-store"
import type { ServerDetails } from "@/type/server-type/servertype"

export function ServerSettingsForm({ server }: { server: ServerDetails }) {
  const { user, accessToken } = useAuthStore()
  const { updateSettings, isSaving, saveError, message } = useServerStore()

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!accessToken) return
    const name = String(new FormData(event.currentTarget).get("name") ?? "").trim()
    await updateSettings(server.id, { name }, accessToken)
  }

  if (server.ownerId !== user?.id) return null
  return <section>
    <h2>Server sozlamalari</h2>
    <form onSubmit={submit}>
      <fieldset disabled={isSaving}>
        <label htmlFor="settings-server-name">Server nomi</label>
        <input id="settings-server-name" name="name" required maxLength={100} defaultValue={server.name} />
        <button type="submit">{isSaving ? "Saqlanmoqda..." : "Saqlash"}</button>
      </fieldset>
    </form>
    {saveError && <p role="alert">{saveError}</p>}
    {message && <p role="status">{message}</p>}
  </section>
}
