"use client"

import type { FormEvent } from "react"
import { useAuthStore } from "@/stores/use-auth-store"
import { useServerMemberStore } from "@/stores/use-server-member-store"
import { useServerStore } from "@/stores/use-server-store"

export function ServerMemberForms({ serverId }: { serverId: string }) {
  const token = useAuthStore((state) => state.accessToken)
  const { addMember, createUser, isSaving } = useServerMemberStore()
  const serverSaving = useServerStore((state) => state.isSaving)

  async function add(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!token) return
    const form = event.currentTarget
    const userId = String(new FormData(form).get("userId") ?? "").trim()
    if (await addMember(serverId, userId, token)) form.reset()
  }
  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!token) return
    const form = event.currentTarget
    const data = new FormData(form)
    if (await createUser(serverId, {
      email: String(data.get("email") ?? ""),
      password: String(data.get("password") ?? ""),
      username: String(data.get("username") ?? ""),
      firstname: String(data.get("firstname") ?? ""),
      lastname: String(data.get("lastname") ?? ""),
    }, token)) form.reset()
  }

  return <section>
    <h2>A’zolarni boshqarish</h2>
    <form onSubmit={add}>
      <fieldset disabled={!token || isSaving || serverSaving}>
        <legend>Mavjud foydalanuvchini qo‘shish</legend>
        <label htmlFor="member-user-id">User ID</label>
        <input id="member-user-id" name="userId" required maxLength={64} />
        <button type="submit">A’zo qo‘shish</button>
      </fieldset>
    </form>
    <form onSubmit={create}>
      <fieldset disabled={!token || isSaving || serverSaving}>
        <legend>Server uchun yangi hisob yaratish</legend>
        <div><label htmlFor="server-user-email">Email</label>
          <input id="server-user-email" name="email" type="email" required maxLength={255} autoComplete="off" /></div>
        <div><label htmlFor="server-user-password">Parol</label>
          <input id="server-user-password" name="password" type="password" required minLength={8} maxLength={100} autoComplete="new-password" /></div>
        <div><label htmlFor="server-user-username">Username (ixtiyoriy)</label>
          <input id="server-user-username" name="username" minLength={3} maxLength={30} pattern="[a-z0-9_]+" autoComplete="off" /></div>
        <div><label htmlFor="server-user-firstname">Ism (ixtiyoriy)</label>
          <input id="server-user-firstname" name="firstname" maxLength={80} /></div>
        <div><label htmlFor="server-user-lastname">Familiya (ixtiyoriy)</label>
          <input id="server-user-lastname" name="lastname" maxLength={80} /></div>
        <button type="submit">Hisob yaratish</button>
      </fieldset>
    </form>
    <p>Yangi hisob faqat shu serverga biriktiriladi va avtomatik a’zo bo‘ladi. Guruhga kirish alohida beriladi.</p>
  </section>
}
