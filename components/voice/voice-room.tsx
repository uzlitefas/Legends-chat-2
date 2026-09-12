"use client"

import { useEffect } from "react"
import Link from "next/link"
import { useAuthStore } from "@/stores/use-auth-store"
import { useVoiceStore } from "@/stores/use-voice-store"
import { VoiceMedia } from "./voice-media"

export function VoiceRoomView({ serverId, groupId, teamId }: { serverId: string; groupId: string; teamId: string }) {
  const token = useAuthStore((state) => state.accessToken)
  const voice = useVoiceStore()
  useEffect(() => {
    const leave = () => useVoiceStore.getState().leave()
    window.addEventListener("pagehide", leave)
    return () => { window.removeEventListener("pagehide", leave); leave() }
  }, [serverId, groupId, teamId])
  const busy = voice.status !== "connected" || voice.mediaBusy
  return <main>
    <h1>Ovozli suhbat {voice.name ?? ""}</h1>
    <Link href={`/servers/${encodeURIComponent(serverId)}/groups/${encodeURIComponent(groupId)}`}>Guruhga qaytish</Link>
    <p>Team ID: {teamId}</p>
    <p role="status">Holat: {voice.status}</p>
    {voice.message && <p role="status">{voice.message}</p>}
    {voice.error && <p role="alert">{voice.error}</p>}
    <button disabled={!token || voice.status !== "idle"} onClick={() => {
      if (token) voice.join({ id: serverId, groupId, teamId }, token)
    }}>Ovozli suhbatga kirish</button>
    <button disabled={voice.status === "idle"} onClick={voice.leave}>Chiqish</button>
    <button disabled={busy} onClick={() => void voice.toggleMicrophone()}>
      {voice.microphoneMuted ? "Mikrofonni yoqish" : "Mikrofonni o‘chirish"}</button>
    <button disabled={busy} onClick={() => void voice.toggleHeadphones()}>
      {voice.headphonesMuted ? "Quloqchinni yoqish" : "Quloqchinni o‘chirish"}</button>
    <button disabled={busy} onClick={() => void voice.toggleScreen()}>
      {voice.screenSharing ? "Ekran ulashni to‘xtatish" : "Ekranni ulash"}</button>
    <VoiceMedia stream={voice.preview} video label="Mening ekranim" />
    <h2>Qatnashchilar ({Object.keys(voice.peers).length})</h2>
    {Object.values(voice.peers).map((peer) => <section key={peer.peerId}>
      <h3>{peer.userId}{peer.peerId === voice.selfId ? " (siz)" : ""}</h3>
      <p>Ulanish: {peer.peerId === voice.selfId ? "Mahalliy" : peer.connection}</p>
      <p>Mikrofon: {peer.media.microphoneMuted ? "O‘chiq" : "Yoniq"}</p>
      <p>Quloqchin: {peer.media.headphonesMuted ? "O‘chiq" : "Yoniq"}</p>
      <p>Ekran: {peer.media.screenSharing ? "Ulashilmoqda" : "Ulashilmayapti"}</p>
      <VoiceMedia stream={peer.audio} muted={voice.headphonesMuted} label={`${peer.userId} ovozi`} />
      {peer.media.screenSharing && <VoiceMedia stream={peer.video} video label={`${peer.userId} ekrani`} />}
    </section>)}
  </main>
}
