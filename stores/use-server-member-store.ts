"use client"

import { create } from "zustand"
import { serverService } from "@/service/server.service"
import { useServerStore } from "@/stores/use-server-store"
import type { ServerMemberActions, ServerMemberState } from "@/type/server-type/server-member-type"

const initialState: ServerMemberState = {
  serverId: null, isSaving: false, error: null, message: null, createdUser: null,
}
let generation = 0

export const useServerMemberStore = create<ServerMemberState & ServerMemberActions>()((set, get) => {
  async function mutate<T>(serverId: string, token: string, request: () => Promise<T>,
    apply: (result: T) => void, message: string) {
    if (get().isSaving) return false
    const current = generation
    set({ serverId, isSaving: true, error: null, message: null, createdUser: null })
    try {
      const result = await request()
      if (current !== generation) return false
      apply(result)
      set({ message })
      // Boshqa server sahifasi ochilgan bo'lsa, uni almashtirmaymiz.
      const servers = useServerStore.getState()
      const refreshes = [servers.loadMine(token)]
      if (servers.server?.id === serverId) refreshes.push(servers.loadOne(serverId, token))
      await Promise.all(refreshes)
      if (current !== generation) return false
      set({ isSaving: false })
      return true
    } catch (error) {
      if (current === generation) set({ isSaving: false, error: error instanceof Error ? error.message : "So'rov bajarilmadi" })
      return false
    }
  }
  return {
    ...initialState,
    clear: () => { generation += 1; set(initialState) },
    addMember: (id, userId, token) => mutate(id, token,
      () => serverService.addMember(id, { userId }, token), () => {}, "A'zo qo'shildi"),
    removeMember: (id, userId, token) => mutate(id, token,
      () => serverService.removeMember(id, userId, token), () => {}, "A'zo serverdan chiqarildi"),
    createUser: (id, payload, token) => mutate(id, token,
      () => serverService.createUser(id, payload, token),
      (createdUser) => set({ createdUser }), "Server foydalanuvchisi yaratildi"),
  }
})
