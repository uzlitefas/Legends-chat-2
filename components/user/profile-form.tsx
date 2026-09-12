"use client"

import type { FormEvent } from "react"
import { useAuthStore } from "@/stores/use-auth-store"
import { useUserStore } from "@/stores/use-user-store"
import type { UpdateUserPayload, User, UserStatus } from "@/type/user-type/usertype"

const fields = [
  { name: "username", label: "Username", max: 30, min: 3, pattern: "[a-z0-9_]+" },
  { name: "firstname", label: "Ism", max: 80 },
  { name: "lastname", label: "Familiya", max: 80 },
  { name: "title", label: "Sarlavha", max: 120 },
  { name: "bio", label: "Bio", max: 2000 },
  { name: "nikname", label: "Taxallus", max: 80 },
  { name: "textstatus", label: "Holat matni", max: 280 },
  { name: "note", label: "Shaxsiy qayd", max: 2000 },
  { name: "avatar", label: "Avatar URL", max: 2048, type: "url" },
  { name: "banner", label: "Banner URL", max: 2048, type: "url" },
  { name: "phonenuber", label: "Telefon", max: 16, type: "tel", pattern: "[+]?[1-9][0-9]{6,14}" },
  { name: "googleemail", label: "Google email", max: 254, type: "email" },
  { name: "githubemail", label: "GitHub email", max: 254, type: "email" },
] satisfies { name: keyof UpdateUserPayload; label: string; max: number; min?: number; pattern?: string; type?: string }[]

export function ProfileForm({ user }: { user: User }) {
  const { isLoading, updateMe, setError } = useUserStore()
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const token = useAuthStore.getState().accessToken
    if (!token) return setError("Avval tizimga kiring")
    const data = new FormData(event.currentTarget)
    const payload: UpdateUserPayload = {}
    for (const field of fields) {
      const value = String(data.get(field.name) ?? "").trim() || null
      if (value !== user[field.name]) payload[field.name] = value
    }
    const email = String(data.get("email") ?? "").trim().toLowerCase()
    if (email !== user.email) payload.email = email
    const ageText = String(data.get("age") ?? "")
    const age = ageText === "" ? null : Number(ageText)
    if (age !== user.age) payload.age = age
    const status = String(data.get("status")) as UserStatus
    if (status !== user.status) payload.status = status
    const friends = String(data.get("bestfriends") ?? "").split(/[\s,]+/).filter(Boolean)
    if (friends.length > 100 || new Set(friends).size !== friends.length || friends.includes(user.id) || friends.some((id) => id.length > 64)) {
      return setError("Do'stlar: ko'pi bilan 100 ta takrorlanmagan ID, har biri 1–64 belgi. O'zingizni qo'sha olmaysiz.")
    }
    if (JSON.stringify(friends) !== JSON.stringify(user.bestfriends)) payload.bestfriends = friends
    if (!Object.keys(payload).length) return setError("O'zgarish kiritilmadi")
    if (await updateMe(payload, token)) {
      const auth = useAuthStore.getState()
      const updated = useUserStore.getState().user
      if (auth.user?.id === updated?.id && auth.user && updated) {
        useAuthStore.setState({ user: { ...auth.user, email: updated.email } })
      }
    }
  }

  return <form onSubmit={submit}>
    <fieldset disabled={isLoading}>
      <legend>Profilni tahrirlash</legend>
      {fields.map((field) => <div key={field.name}>
        <label htmlFor={field.name}>{field.label}</label>
        <input id={field.name} name={field.name} defaultValue={user[field.name] ?? ""}
          maxLength={field.max} minLength={"min" in field ? field.min : undefined}
          pattern={"pattern" in field ? field.pattern : undefined} type={"type" in field ? field.type : "text"} />
      </div>)}
      <div><label htmlFor="profile-email">Email</label>
        <input id="profile-email" name="email" type="email" required maxLength={254} defaultValue={user.email} /></div>
      <div><label htmlFor="age">Yosh</label>
        <input id="age" name="age" type="number" min={0} max={150} step={1} defaultValue={user.age ?? ""} /></div>
      <div><label htmlFor="status">Holat</label>
        <select id="status" name="status" defaultValue={user.status}>
          {["online", "offline", "idle", "dnd"].map((status) => <option key={status}>{status}</option>)}
        </select></div>
      <div><label htmlFor="bestfriends">Yaqin do'stlar IDlari (vergul yoki yangi qator bilan)</label>
        <textarea id="bestfriends" name="bestfriends" defaultValue={user.bestfriends.join("\n")} /></div>
      <p>Ixtiyoriy maydonni bo'shatish undagi qiymatni o'chiradi.</p>
      <button type="submit">Saqlash</button>
    </fieldset>
  </form>
}
