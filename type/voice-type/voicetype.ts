export type VoiceRoomParams = { id: string; groupId: string; teamId: string }
export type VoiceRoom = { roomId: string; serverId: string; groupId: string; teamId: string; name: string }
export type VoiceParticipant = { peerId: string; userId: string }
export type VoiceMediaState = { peerId: string; microphoneMuted: boolean; headphonesMuted: boolean; screenSharing: boolean }
export type VoiceJoined = VoiceRoom & {
  peerId: string
  capacity: number
  participants: VoiceParticipant[]
  mediaStates: VoiceMediaState[]
}
export type VoiceIceConfiguration = {
  iceServers: RTCIceServer[]
  iceTransportPolicy: RTCIceTransportPolicy
  expiresAt: number | null
}
export type VoiceCallbacks = {
  joined: (reply: VoiceJoined) => void
  participant: (participant: VoiceParticipant) => void
  departed: (peerId: string) => void
  state: (state: VoiceMediaState) => void
  connection: (peerId: string, state: RTCPeerConnectionState) => void
  track: (peerId: string, track: MediaStreamTrack) => void
  preview: (stream: MediaStream | null) => void
  error: (message: string) => void
  closed: (message: string, retry: boolean) => void
}
export type VoicePeerView = VoiceParticipant & {
  media: VoiceMediaState
  connection: string
  audio: MediaStream | null
  video: MediaStream | null
}
export type VoiceState = {
  room: VoiceRoomParams | null
  name: string | null
  selfId: string | null
  status: "idle" | "connecting" | "connected" | "reconnecting"
  message: string | null
  error: string | null
  peers: Record<string, VoicePeerView>
  preview: MediaStream | null
  microphoneMuted: boolean
  headphonesMuted: boolean
  screenSharing: boolean
  mediaBusy: boolean
}
export type VoiceActions = {
  join: (room: VoiceRoomParams, token: string) => void
  leave: () => void
  toggleMicrophone: () => Promise<void>
  toggleHeadphones: () => Promise<void>
  toggleScreen: () => Promise<void>
}
