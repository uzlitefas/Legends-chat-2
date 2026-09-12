"use client"

import { useEffect } from "react"
import { useAuthStore } from "@/stores/use-auth-store"
import { useUserStore } from "@/stores/use-user-store"
import { ProfileDetails } from "./profile-details"
import { ProfileForm } from "./profile-form"
import { UserFeedback } from "./user-feedback"

export function OwnProfile() {
  const token = useAuthStore((state) => state.accessToken)
  const { user, loadMe, isLoading } = useUserStore()
  useEffect(() => { if (token) void loadMe(token) }, [token, loadMe])
  return <main>
    <h1>Profilim</h1>
    <button disabled={isLoading || !token} onClick={() => { if (token) void loadMe(token) }}>Qayta yuklash</button>
    <UserFeedback />
    {user && <>
      <ProfileDetails profile={user} />
      <p>Biriktirilgan server: {user.assignedServerId ?? "Yo'q"}</p>
      <ProfileForm key={`${user.id}:${user.updatedAt}`} user={user} />
    </>}
  </main>
}
