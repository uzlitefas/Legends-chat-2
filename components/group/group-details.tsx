"use client"

import { useEffect } from "react"
import type { FormEvent } from "react"
import Link from "next/link"
import { useAuthStore } from "@/stores/use-auth-store"
import { useServerStore } from "@/stores/use-server-store"
import { emptyGroupEntry, groupKey, useGroupStore } from "@/stores/use-group-store"
import { GroupFeedback } from "./group-feedback"

export function GroupDetailsView({ serverId, groupId }: { serverId: string; groupId: string }) {
  const { accessToken, user } = useAuthStore()
  const { server, loadOne, detailError } = useServerStore()
  const owner = server?.id === serverId && server.ownerId === user?.id
  const entry = useGroupStore((state) => state.entries[groupKey(serverId, groupId)] ?? emptyGroupEntry)
  const { load, addMember, removeMember, setAccess } = useGroupStore()
  useEffect(() => { if (accessToken) void loadOne(serverId, accessToken) }, [serverId, accessToken, loadOne])
  useEffect(() => { if (accessToken) void load(serverId, groupId, accessToken, owner) }, [serverId, groupId, accessToken, owner, load])
  async function add(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!accessToken) return
    const form = event.currentTarget
    const userId = String(new FormData(form).get("userId") ?? "").trim()
    if (await addMember(serverId, groupId, userId, accessToken)) form.reset()
  }
  const busy = entry.loading || entry.saving || !accessToken
  return <main>
    <h1>Guruh</h1>
    <Link href={`/servers/${encodeURIComponent(serverId)}`}>Serverga qaytish</Link>
    <button disabled={busy} onClick={() => {
      if (accessToken) { void loadOne(serverId, accessToken); void load(serverId, groupId, accessToken, owner) }
    }}>Qayta yuklash</button>
    {detailError && <p role="alert">Server: {detailError}</p>}
    <GroupFeedback entry={entry} />
    {entry.group && <>
      <h2>{entry.group.name}</h2>
      <p>Guruh ID: {entry.group.id}</p><p>Server ID: {entry.group.serverId}</p>
      <p>Yaratilgan: {entry.group.createdAt}</p><p>Yangilangan: {entry.group.updatedAt}</p>
      {owner && <form onSubmit={add}>
        <fieldset disabled={busy}>
          <legend>Guruhga a’zo qo‘shish</legend>
          <label htmlFor="group-user-id">User ID</label>
          <input id="group-user-id" name="userId" required maxLength={64} />
          <button type="submit">Qo‘shish</button>
        </fieldset>
        <p>Foydalanuvchi avval server a’zosi bo‘lishi kerak. Qo‘shilgandan keyin kirish ruxsatini oching.</p>
      </form>}
      <h2>A’zolar va kirish ruxsatlari</h2>
      <ul>{entry.group.members.map((member) => {
        const setting = entry.settings?.find((item) => item.userId === member.userId)
        const canEnter = setting?.canEnter ?? member.canEnter
        return <li key={member.userId}>
          <p>{member.serverMember.user.username ?? member.serverMember.user.firstname ?? member.userId}</p>
          <p>User ID: {member.userId}</p>
          <p>Hisob turi: {member.serverMember.user.accountType}</p>
          <p>Holat: {member.serverMember.user.status}</p>
          <p>Qo‘shilgan: {member.createdAt}</p>
          <p>Kirish: {canEnter ? "Ruxsat berilgan" : "Yopiq"}</p>
          {setting && <p>Ruxsat yangilangan: {setting.updatedAt}</p>}
          {owner && member.userId !== server?.ownerId && <>
            <button disabled={busy} onClick={() => {
              if (accessToken) void setAccess(serverId, groupId, member.userId, !canEnter, accessToken)
            }}>{canEnter ? "Kirishni yopish" : "Kirishga ruxsat berish"}</button>
            <button disabled={busy} onClick={() => {
              if (accessToken) void removeMember(serverId, groupId, member.userId, accessToken)
            }}>Guruhdan chiqarish</button>
          </>}
        </li>
      })}</ul>
    </>}
  </main>
}
