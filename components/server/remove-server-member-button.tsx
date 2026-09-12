"use client"

import { useAuthStore } from "@/stores/use-auth-store"
import { useServerMemberStore } from "@/stores/use-server-member-store"
import { useServerStore } from "@/stores/use-server-store"

export function RemoveServerMemberButton({ serverId, userId }: { serverId: string; userId: string }) {
  const token = useAuthStore((state) => state.accessToken)
  const { removeMember, isSaving } = useServerMemberStore()
  const serverSaving = useServerStore((state) => state.isSaving)
  return <button type="button" disabled={!token || isSaving || serverSaving}
    onClick={() => { if (token) void removeMember(serverId, userId, token) }}>
    Serverdan chiqarish
  </button>
}
