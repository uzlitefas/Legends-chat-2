"use client"

import { useEffect, useRef, useState } from "react"

export function VoiceMedia({ stream, video = false, muted = false, label }: {
  stream: MediaStream | null; video?: boolean; muted?: boolean; label: string
}) {
  const ref = useRef<HTMLVideoElement & HTMLAudioElement>(null)
  const [blocked, setBlocked] = useState(false)
  useEffect(() => {
    const element = ref.current
    if (!element || !stream) return
    let active = true
    element.srcObject = stream
    const play = () => { void element.play().then(() => { if (active) setBlocked(false) }).catch(() => { if (active) setBlocked(true) }) }
    play()
    stream.getTracks().forEach((track) => track.addEventListener("unmute", play))
    return () => {
      active = false
      stream.getTracks().forEach((track) => track.removeEventListener("unmute", play))
      element.pause()
      element.srcObject = null
    }
  }, [stream])
  if (!stream) return null
  return <>
    {video ? <video ref={ref} autoPlay playsInline muted aria-label={label} controls />
      : <audio ref={ref} autoPlay muted={muted} aria-label={label} />}
    {blocked && <button onClick={() => {
      void ref.current?.play().then(() => setBlocked(false)).catch(() => setBlocked(true))
    }}>Ijroni yoqish: {label}</button>}
  </>
}
