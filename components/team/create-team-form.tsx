"use client"

import type { FormEvent } from "react"
import { useAuthStore } from "@/stores/use-auth-store"
import { groupKey, useGroupStore } from "@/stores/use-group-store"
import { emptyTeamEntry, useTeamStore } from "@/stores/use-team-store"

export function CreateTeamForm({ serverId, groupId }: { serverId: string; groupId: string }) {
  const token = useAuthStore((state) => state.accessToken)
  const entry = useTeamStore((state) => state.entries[groupKey(serverId, groupId)] ?? emptyTeamEntry)
  const group = useGroupStore((state) => state.entries[groupKey(serverId, groupId)])
  const createTeam = useTeamStore((state) => state.createTeam)
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!token) return
    const form = event.currentTarget
    const name = String(new FormData(form).get("name") ?? "")
    if (await createTeam(serverId, groupId, { name }, token)) form.reset()
  }
  return <form onSubmit={submit}>
    <fieldset disabled={!token || entry.isSaving || group?.loading || group?.saving}>
      <legend>Team yaratish</legend>
      <label htmlFor="team-name">Team nomi</label>
      <input id="team-name" name="name" required maxLength={100} />
      <button type="submit">Yaratish</button>
    </fieldset>
  </form>
}
