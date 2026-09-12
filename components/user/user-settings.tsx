"use client"

import { useEffect, useState } from "react"
import type { FormEvent } from "react"
import { useAuthStore } from "@/stores/use-auth-store"
import { useUserStore } from "@/stores/use-user-store"
import type { UpdateUserSettingsPayload, UserRole } from "@/type/user-type/usertype"
import { UserFeedback } from "./user-feedback"

const roles: UserRole[] = ["USER", "ADMIN_MEMBER", "ADMIN", "SUPER_ADMIN"]

export function UserSettings() {
  const token = useAuthStore((state) => state.accessToken)
  const { user, loadMe, updateSettings, updatePremium, isLoading, setError, clearError } = useUserStore()
  const [targetId, setTargetId] = useState("")
  useEffect(() => { if (token) void loadMe(token) }, [token, loadMe])

  async function submit(event: FormEvent<HTMLFormElement>, premiumOnly: boolean) {
    event.preventDefault()
    if (!token) return setError("Avval tizimga kiring")
    const id = targetId.trim()
    if (!/^[A-Za-z0-9_-]{1,64}$/.test(id)) return setError("To'g'ri User ID kiriting")
    const data = new FormData(event.currentTarget)
    if (premiumOnly) {
      await updatePremium(id, data.get("premium") === "true", token)
      return
    }
    const payload: UpdateUserSettingsPayload = {}
    if (data.has("changeRoles")) {
      payload.roles = data.getAll("roles") as UserRole[]
      if (!payload.roles.length) return setError("Kamida bitta rol tanlang")
    }
    if (data.has("changePremium")) payload.premium = data.get("premium") === "true"
    if (!Object.keys(payload).length) return setError("O'zgartiriladigan sozlamani belgilang")
    if (await updateSettings(id, payload, token)) {
      const auth = useAuthStore.getState()
      const me = useUserStore.getState().user
      if (auth.user?.id === id && auth.user && me?.id === id) {
        const role = [...roles].reverse().find((value) => me.roles.includes(value)) ?? "USER"
        useAuthStore.setState({ user: { ...auth.user, role } })
      }
    }
  }

  return <main>
    <h1>User sozlamalari va premium</h1>
    <button disabled={isLoading || !token} onClick={() => { if (token) void loadMe(token) }}>Huquqlarni qayta yuklash</button>
    <UserFeedback />
    {user?.accountType === "REGULAR" && user.roles.includes("SUPER_ADMIN") ? <>
      <div>
        <label htmlFor="settings-user-id">Sozlamalari o'zgartiriladigan User ID</label>
        <input id="settings-user-id" value={targetId} disabled={isLoading} maxLength={64}
          onChange={(event) => { setTargetId(event.target.value); clearError() }} />
      </div>
      <form onSubmit={(event) => void submit(event, false)}>
        <fieldset disabled={isLoading}>
          <legend>Rollar va premium sozlamalari</legend>
          <label><input type="checkbox" name="changeRoles" />Rollarni almashtirish</label>
          <p>Tanlangan rollar foydalanuvchining mavjud rollari o'rniga yoziladi.</p>
          {roles.map((role) => <label key={role}>
            <input type="checkbox" name="roles" value={role} />{role}
          </label>)}
          <div><label><input type="checkbox" name="changePremium" />Premiumni o'zgartirish</label></div>
          <label htmlFor="settings-premium">Premium holati</label>
          <select id="settings-premium" name="premium" defaultValue="false">
            <option value="false">O'chirilgan</option><option value="true">Yoqilgan</option>
          </select>
          <button type="submit">Sozlamalarni saqlash</button>
        </fieldset>
      </form>
      <form onSubmit={(event) => void submit(event, true)}>
        <fieldset disabled={isLoading}>
          <legend>Premiumni alohida boshqarish</legend>
          <label htmlFor="premium-only">Premium holati</label>
          <select id="premium-only" name="premium" defaultValue="false">
            <option value="false">O'chirilgan</option><option value="true">Yoqilgan</option>
          </select>
          <button type="submit">Premiumni saqlash</button>
        </fieldset>
      </form>
    </> : user && <p>Bu amallar faqat SUPER_ADMIN uchun.</p>}
  </main>
}
