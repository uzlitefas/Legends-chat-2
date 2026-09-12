"use client"

import { create } from "zustand"
import { VoiceSession } from "@/lib/voice/session.js"
import type { VoiceActions, VoiceCallbacks, VoiceRoomParams, VoiceState } from "@/type/voice-type/voicetype"

const initialState: VoiceState = {
  room: null, name: null, selfId: null, status: "idle", message: null, error: null,
  peers: {}, preview: null, microphoneMuted: true, headphonesMuted: false,
  screenSharing: false, mediaBusy: false,
}
let session: VoiceSession | null = null
let reconnectTimer: ReturnType<typeof setTimeout> | null = null
let version = 0

export const useVoiceStore = create<VoiceState & VoiceActions>()((set, get) => {
  async function connect(room: VoiceRoomParams, token: string, attempt: number, current: number) {
    if (current !== version) return
    set({ room, status: attempt ? "reconnecting" : "connecting" })
    const callbacks: VoiceCallbacks = {
      joined: (reply) => {
        attempt = 0
        set({ selfId: reply.peerId, name: reply.name, status: "connected", error: null, message: "Ulandi" })
      },
      participant: (participant) => set((state) => ({ peers: {
        ...state.peers,
        [participant.peerId]: state.peers[participant.peerId] ?? {
          ...participant, connection: "connecting", audio: null, video: null,
          media: { peerId: participant.peerId, microphoneMuted: true, headphonesMuted: false, screenSharing: false },
        },
      } })),
      departed: (id) => set((state) => {
        const peers = { ...state.peers }
        delete peers[id]
        return { peers }
      }),
      state: (media) => set((state) => ({
        peers: state.peers[media.peerId] ? {
          ...state.peers, [media.peerId]: { ...state.peers[media.peerId], media },
        } : state.peers,
        ...(state.selfId === media.peerId ? {
          microphoneMuted: media.microphoneMuted, headphonesMuted: media.headphonesMuted, screenSharing: media.screenSharing,
        } : {}),
      })),
      connection: (id, connection) => set((state) => ({ peers: state.peers[id]
        ? { ...state.peers, [id]: { ...state.peers[id], connection } } : state.peers })),
      track: (id, track) => {
        const key = track.kind === "audio" ? "audio" : "video"
        const stream = new MediaStream([track])
        set((state) => ({ peers: state.peers[id]
          ? { ...state.peers, [id]: { ...state.peers[id], [key]: stream } } : state.peers }))
        track.onended = () => {
          if (current !== version) return
          set((state) => ({ peers: state.peers[id]?.[key] === stream
            ? { ...state.peers, [id]: { ...state.peers[id], [key]: null } } : state.peers }))
        }
      },
      preview: (preview) => set({ preview }),
      error: (error) => set({ error }),
      closed: (message, retry) => {
        if (current !== version) return
        session = null
        set({ ...initialState, message })
        if (retry && attempt < 6) {
          set({ room, status: "reconnecting", message: `Qayta ulanish ${attempt + 1}/6` })
          reconnectTimer = setTimeout(() => {
            reconnectTimer = null
            void connect(room, token, attempt + 1, current)
          }, Math.min(1000 * 2 ** attempt, 10000))
        } else if (retry) set({ error: "Qayta ulanish bajarilmadi. Qayta kirishni bosing." })
      },
    }
    let instance: VoiceSession | null = null
    try {
      instance = new VoiceSession(room, token, callbacks)
      session = instance
      await instance.enter()
    } catch (error) {
      if (current !== version || instance?.closed) return
      const message = error instanceof Error ? error.message : "Ulanish bajarilmadi"
      const retry = attempt > 0 && (
        message === "User is already connected to this voice room" || message === "websocket error" ||
        message === "Connection timed out." || error instanceof TypeError
      )
      if (instance) instance.close(message, retry)
      else set({ ...initialState, error: message })
    }
  }

  async function mediaAction(action: (current: VoiceSession) => Promise<unknown>, screen = false) {
    const current = session
    if (!current?.ready || get().mediaBusy) return
    set({ mediaBusy: true, error: null })
    try {
      await action(current)
    } catch (error) {
      if (session !== current) return
      const message = error instanceof Error ? error.message : "Media amali bajarilmadi"
      if (screen && error instanceof Error && ["NotAllowedError", "NotFoundError"].includes(error.name)) {
        set({ error: "Ekran tanlash bekor qilindi. Qayta urinishingiz mumkin." })
      } else current.close(message)
    } finally {
      if (session === current) set({ mediaBusy: false })
    }
  }
  return {
    ...initialState,
    join: (room, token) => {
      if (session || reconnectTimer || get().status !== "idle") return
      if (!token) { set({ error: "Avval tizimga kiring" }); return }
      set({ ...initialState })
      void connect(room, token, 0, ++version)
    },
    leave: () => {
      version += 1
      if (reconnectTimer) clearTimeout(reconnectTimer)
      reconnectTimer = null
      session?.close()
      session = null
      set({ ...initialState, message: "Xonadan chiqildi" })
    },
    toggleMicrophone: () => mediaAction(async (current) => {
      const { state } = await current.setMuted(!get().microphoneMuted)
      if (session === current) set({ microphoneMuted: state.microphoneMuted })
    }),
    toggleHeadphones: () => mediaAction(async (current) => {
      const muted = !get().headphonesMuted
      if (muted) set({ headphonesMuted: true })
      const { state } = await current.send("voice:headphones", { ...current.room, muted })
      if (session === current) set({ headphonesMuted: state.headphonesMuted })
    }),
    toggleScreen: () => mediaAction(async (current) => {
      if (current.screen) await current.stopScreen()
      else await current.startScreen()
    }, true),
  }
})
