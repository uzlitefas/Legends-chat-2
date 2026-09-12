"use client"

import { create } from "zustand"
import { teamService } from "@/service/team.service"
import { groupKey, useGroupStore } from "@/stores/use-group-store"
import type { TeamEntry, TeamStore } from "@/type/team-type/teamtype"

export const emptyTeamEntry: TeamEntry = { isSaving: false, error: null, createdTeam: null }
let generation = 0

export const useTeamStore = create<TeamStore>()((set, get) => {
  const patch = (key: string, values: Partial<TeamEntry>) => set((state) => ({
    entries: { ...state.entries, [key]: { ...(state.entries[key] ?? emptyTeamEntry), ...values } },
  }))
  return {
    entries: {},
    clear: () => { generation += 1; set({ entries: {} }) },
    createTeam: async (serverId, groupId, payload, token) => {
      const key = groupKey(serverId, groupId)
      const groupEntry = useGroupStore.getState().entries[key]
      if (get().entries[key]?.isSaving || groupEntry?.saving || groupEntry?.loading) return false
      const current = generation
      patch(key, { isSaving: true, error: null, createdTeam: null })
      try {
        const createdTeam = await teamService.create(serverId, groupId, payload, token)
        if (current !== generation) return false
        patch(key, { createdTeam })
        // Backend teamlar ro'yxatini guruh tafsilotidagi teams maydonida beradi.
        await useGroupStore.getState().load(serverId, groupId, token, true)
        if (current !== generation) return false
        patch(key, { isSaving: false })
        return true
      } catch (error) {
        if (current === generation) patch(key, {
          isSaving: false, error: error instanceof Error ? error.message : "So'rov bajarilmadi",
        })
        return false
      }
    },
  }
})
