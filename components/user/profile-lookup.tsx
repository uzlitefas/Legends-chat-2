"use client"

import type { FormEvent } from "react"
import { useAuthStore } from "@/stores/use-auth-store"
import { useUserStore } from "@/stores/use-user-store"
import { ProfileDetails } from "./profile-details"
import { UserFeedback } from "./user-feedback"

export function ProfileLookup() {
  const { profile, loadProfile, isLoading, setError } = useUserStore()
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const token = useAuthStore.getState().accessToken
    if (!token) return setError("Avval tizimga kiring")
    const id = String(new FormData(event.currentTarget).get("userId") ?? "").trim()
    await loadProfile(id, token)
  }
  return <main>
    <h1>Foydalanuvchi profili</h1>
    <form onSubmit={submit}>
      <label htmlFor="lookup-id">User ID</label>
      <input id="lookup-id" name="userId" required maxLength={64} pattern="[A-Za-z0-9_\-]+" />
      <button disabled={isLoading}>Ochish</button>
    </form>
    <UserFeedback />
    {profile && <ProfileDetails profile={profile} />}
  </main>
}
