import type { VoiceCallbacks, VoiceRoomParams, VoiceMediaState } from "@/type/voice-type/voicetype"

export class VoiceSession {
  constructor(room: VoiceRoomParams, token: string, callbacks: VoiceCallbacks)
  room: VoiceRoomParams
  ready: boolean
  closed: boolean
  screen: MediaStream | null
  enter(): Promise<void>
  send<T = { state: VoiceMediaState }>(event: string, payload?: unknown): Promise<T>
  setMuted(muted: boolean): Promise<{ state: VoiceMediaState }>
  startScreen(): Promise<void>
  stopScreen(): Promise<void>
  close(message?: string, retry?: boolean): void
}
