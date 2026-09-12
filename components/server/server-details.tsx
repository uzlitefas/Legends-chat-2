"use client"

import { useEffect } from "react"
import Link from "next/link"
import { useAuthStore } from "@/stores/use-auth-store"
import { useServerStore } from "@/stores/use-server-store"
import { ServerSettingsForm } from "./server-settings-form"

export function ServerDetailsView({ serverId }: { serverId: string }) {
  const { accessToken, user } = useAuthStore()
  const { server, loadOne, isDetailLoading, isSaving, detailError } = useServerStore()
  useEffect(() => { if (accessToken) void loadOne(serverId, accessToken) }, [serverId, accessToken, loadOne])
  const current = server?.id === serverId ? server : null

  return <main>
    <h1>Server</h1>
    {!user?.defaultServerId && <Link href="/servers">Serverlarim</Link>}
    <button disabled={!accessToken || isDetailLoading || isSaving}
      onClick={() => { if (accessToken) void loadOne(serverId, accessToken) }}>Qayta yuklash</button>
    {isDetailLoading && <p role="status">Yuklanmoqda...</p>}
    {detailError && <p role="alert">{detailError}</p>}
    {current && <>
      <h2>{current.name}</h2>
      <dl>
        <dt>Server ID</dt><dd>{current.id}</dd>
        <dt>Ega ID</dt><dd>{current.ownerId}</dd>
        <dt>A’zolar soni</dt><dd>{current.members.length}</dd>
        <dt>Yaratilgan</dt><dd>{current.createdAt}</dd>
        <dt>Yangilangan</dt><dd>{current.updatedAt}</dd>
      </dl>
      <ServerSettingsForm key={`${current.id}:${current.updatedAt}`} server={current} />
      <h2>A’zolar</h2>
      <ul>{current.members.map((member) => <li key={member.userId}>
        <p>{member.user.username ?? member.user.firstname ?? member.userId}</p>
        <p>User ID: {member.userId}</p>
        <p>Ism: {member.user.firstname ?? "—"} {member.user.lastname}</p>
        <p>Holat: {member.user.status}</p>
        <p>Hisob turi: {member.user.accountType}</p>
        <p>Qo‘shilgan: {member.joinedAt}</p>
      </li>)}</ul>
    </>}
  </main>
}
