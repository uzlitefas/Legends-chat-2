"use client"

import { create } from "zustand"
import { serverService } from "@/service/server.service"
import type { ServerActions, ServerState } from "@/type/server-type/servertype"

const initialState: ServerState = {
  servers: [], server: null, createdServer: null,
  isListLoading: false, isDetailLoading: false, isSaving: false,
  listError: null, detailError: null, saveError: null, message: null,
}
const messageOf = (error: unknown) => error instanceof Error ? error.message : "So'rov bajarilmadi"
let generation = 0
let listRequest = 0
let detailRequest = 0

export const useServerStore = create<ServerState & ServerActions>()((set, get) => ({
  ...initialState,
  clear: () => {
    generation += 1
    listRequest += 1
    detailRequest += 1
    set(initialState)
  },
  loadMine: async (token) => {
    const request = ++listRequest
    set({ isListLoading: true, listError: null })
    try {
      const servers = await serverService.getMine(token)
      if (request === listRequest) set({ servers, isListLoading: false })
    } catch (error) {
      if (request === listRequest) set({ servers: [], isListLoading: false, listError: messageOf(error) })
    }
  },
  loadOne: async (id, token) => {
    const request = ++detailRequest
    set({ server: null, isDetailLoading: true, detailError: null, saveError: null, message: null })
    try {
      const server = await serverService.getOne(id, token)
      if (request === detailRequest) set({ server, isDetailLoading: false })
    } catch (error) {
      if (request === detailRequest) set({ server: null, isDetailLoading: false, detailError: messageOf(error) })
    }
  },
  createServer: async (payload, token, actorId) => {
    if (get().isSaving) return false
    const current = generation
    set({ isSaving: true, saveError: null, message: null, createdServer: null })
    try {
      const createdServer = await serverService.create(payload, token)
      if (current !== generation) return false
      // Yaratuvchi boshqa userga berilgan serverga avtomatik a'zo emas.
      listRequest += 1
      set((state) => ({
        createdServer, isSaving: false, isListLoading: false,
        servers: createdServer.ownerId === actorId
          ? [createdServer, ...state.servers.filter((server) => server.id !== createdServer.id)]
          : state.servers,
        message: "Server yaratildi",
      }))
      // Shu paytda davom etgan ro'yxat so'rovi bekor bo'lgan bo'lishi mumkin.
      void get().loadMine(token)
      return true
    } catch (error) {
      if (current === generation) set({ isSaving: false, saveError: messageOf(error) })
      return false
    }
  },
  updateSettings: async (id, payload, token) => {
    if (get().isSaving) return false
    const current = generation
    set({ isSaving: true, saveError: null, message: null })
    try {
      const updated = await serverService.updateSettings(id, payload, token)
      if (current !== generation) return false
      listRequest += 1
      set((state) => ({
        isSaving: false, isListLoading: false,
        servers: state.servers.map((server) => server.id === id ? updated : server),
        server: state.server?.id === id ? { ...state.server, ...updated } : state.server,
        createdServer: state.createdServer?.id === id ? updated : state.createdServer,
        message: "Server nomi saqlandi",
      }))
      void get().loadMine(token)
      return true
    } catch (error) {
      if (current === generation) set({ isSaving: false, saveError: messageOf(error) })
      return false
    }
  },
}))
