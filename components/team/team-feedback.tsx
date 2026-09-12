"use client"

import { groupKey } from "@/stores/use-group-store"
import { emptyTeamEntry, useTeamStore } from "@/stores/use-team-store"

export function TeamFeedback({ serverId, groupId }: { serverId: string; groupId: string }) {
  const entry = useTeamStore((state) => state.entries[groupKey(serverId, groupId)] ?? emptyTeamEntry)
  return <>
    {entry.isSaving && <p role="status">Team yaratilmoqda...</p>}
    {entry.error && <p role="alert">{entry.error}</p>}
    {entry.createdTeam && <p role="status">Team yaratildi: {entry.createdTeam.name}. ID: {entry.createdTeam.id}</p>}
  </>
}
