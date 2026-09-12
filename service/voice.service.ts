import { apiRequest } from "@/service/api"
import type { VoiceIceConfiguration, VoiceRoom, VoiceRoomParams } from "@/type/voice-type/voicetype"

function path(room: VoiceRoomParams) {
  if (![room.id, room.groupId, room.teamId].every((id) => /^[A-Za-z0-9_-]{1,64}$/.test(id))) {
    throw new Error("Voice xona IDlari noto'g'ri")
  }
  return `servers/${encodeURIComponent(room.id)}/groups/${encodeURIComponent(room.groupId)}/teams/${encodeURIComponent(room.teamId)}/voice`
}
function options(token: string, signal?: AbortSignal): RequestInit {
  if (!token.trim()) throw new Error("Access token talab qilinadi")
  return { headers: { Authorization: `Bearer ${token}` }, signal }
}
export function voiceSocketUrl() {
  const configured = process.env.NEXT_PUBLIC_VOICE_URL
  if (configured) return configured.replace(/\/$/, "")
  const api = new URL(process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api", window.location.origin)
  return `${api.origin}/voice`
}
export const voiceService = {
  async room(room: VoiceRoomParams, token: string, signal?: AbortSignal): Promise<VoiceRoom> {
    return apiRequest<VoiceRoom>(path(room), options(token, signal))
  },
  async ice(room: VoiceRoomParams, token: string, signal?: AbortSignal): Promise<VoiceIceConfiguration> {
    return apiRequest<VoiceIceConfiguration>(`${path(room)}/ice`, options(token, signal))
  },
}
