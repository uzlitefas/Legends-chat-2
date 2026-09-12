"use client"

import { create } from "zustand"
import { groupService } from "@/service/group.service"
import type { GroupEntry, GroupStore } from "@/type/group-type/grouptype"

export const emptyGroupEntry: GroupEntry = {
  groups: [], group: null, settings: null, loading: false, saving: false,
  error: null, settingsError: null, message: null,
}
export const groupKey = (serverId: string, groupId: string | null = null) => `${serverId}/${groupId ?? ""}`
let generation = 0
const requests = new Map<string, number>()
const errorText = (error: unknown) => error instanceof Error ? error.message : "So'rov bajarilmadi"

export const useGroupStore = create<GroupStore>()((set, get) => {
  const entry = (key: string) => get().entries[key] ?? emptyGroupEntry
  const patch = (key: string, values: Partial<GroupEntry>) => set((state) => ({
    entries: { ...state.entries, [key]: { ...(state.entries[key] ?? emptyGroupEntry), ...values } },
  }))
  async function mutate(serverId: string, groupId: string | null, token: string, request: () => Promise<unknown>, message: string) {
    const key = groupKey(serverId, groupId)
    if (entry(key).saving) return false
    const current = generation
    patch(key, { saving: true, error: null, message: null })
    try {
      await request()
      if (current !== generation) return false
      patch(key, { message })
      await get().load(serverId, groupId, token, true)
      if (current !== generation) return false
      if (groupId) await get().load(serverId, null, token)
      if (current !== generation) return false
      patch(key, { saving: false })
      return true
    } catch (error) {
      if (current === generation) patch(key, { saving: false, error: errorText(error) })
      return false
    }
  }
  return {
    entries: {},
    clear: () => { generation += 1; requests.clear(); set({ entries: {} }) },
    load: async (serverId, groupId, token, owner = false) => {
      const key = groupKey(serverId, groupId)
      const request = (requests.get(key) ?? 0) + 1
      requests.set(key, request)
      const current = generation
      const active = () => current === generation && requests.get(key) === request
      patch(key, { loading: true, error: null, settings: null, settingsError: null, group: null })
      try {
        if (!groupId) {
          const groups = await groupService.list(serverId, token)
          if (active()) patch(key, { groups, loading: false })
          return
        }
        const group = await groupService.get(serverId, groupId, token)
        if (!active()) return
        patch(key, { group })
        if (owner) {
          try {
            const settings = await groupService.settings(serverId, groupId, token)
            if (active()) patch(key, { settings })
          } catch (error) {
            if (active()) patch(key, { settingsError: errorText(error) })
          }
        }
        if (active()) patch(key, { loading: false })
      } catch (error) {
        if (active()) patch(key, { groups: [], group: null, loading: false, error: errorText(error) })
      }
    },
    createGroup: (serverId, name, token) => mutate(serverId, null, token,
      () => groupService.create(serverId, { name }, token), "Guruh yaratildi"),
    addMember: (serverId, groupId, userId, token) => mutate(serverId, groupId, token,
      () => groupService.addMember(serverId, groupId, { userId }, token), "A'zo qo'shildi. Kirish ruxsati hozir yopiq."),
    removeMember: (serverId, groupId, userId, token) => mutate(serverId, groupId, token,
      () => groupService.removeMember(serverId, groupId, userId, token), "A'zo guruhdan chiqarildi"),
    setAccess: (serverId, groupId, userId, canEnter, token) => mutate(serverId, groupId, token,
      () => groupService.updateAccess(serverId, groupId, userId, { canEnter }, token), "Kirish ruxsati saqlandi"),
  }
})
