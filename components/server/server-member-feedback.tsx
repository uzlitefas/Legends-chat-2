"use client"

import { useServerMemberStore } from "@/stores/use-server-member-store"

export function ServerMemberFeedback({ serverId }: { serverId: string }) {
  const state = useServerMemberStore()
  if (state.serverId !== serverId) return null
  return <section>
    {state.isSaving && <p role="status">Kutilmoqda...</p>}
    {state.error && <p role="alert">{state.error}</p>}
    {state.message && <p role="status">{state.message}</p>}
    {state.createdUser && <dl>
      <dt>Yangi user ID</dt><dd>{state.createdUser.id}</dd>
      <dt>Email</dt><dd>{state.createdUser.email}</dd>
      <dt>Username</dt><dd>{state.createdUser.username ?? "—"}</dd>
      <dt>Ism</dt><dd>{state.createdUser.firstname ?? "—"}</dd>
      <dt>Familiya</dt><dd>{state.createdUser.lastname ?? "—"}</dd>
      <dt>Hisob turi</dt><dd>{state.createdUser.accountType}</dd>
      <dt>Server ID</dt><dd>{state.createdUser.assignedServerId}</dd>
      <dt>Yaratilgan</dt><dd>{state.createdUser.createdAt}</dd>
    </dl>}
  </section>
}
