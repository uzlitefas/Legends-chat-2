"use client"

import { useEffect } from "react"
import type { FormEvent } from "react"
import Link from "next/link"
import { useAuthStore } from "@/stores/use-auth-store"
import { emptyGroupEntry, groupKey, useGroupStore } from "@/stores/use-group-store"
import { GroupFeedback } from "./group-feedback"

export function GroupList({ serverId, ownerId }: { serverId: string; ownerId: string }) {
  const { accessToken, user } = useAuthStore()
  const entry = useGroupStore((state) => state.entries[groupKey(serverId)] ?? emptyGroupEntry)
  const { load, createGroup } = useGroupStore()
  useEffect(() => { if (accessToken) void load(serverId, null, accessToken) }, [serverId, accessToken, load])
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!accessToken) return
    const form = event.currentTarget
    const name = String(new FormData(form).get("name") ?? "")
    if (await createGroup(serverId, name, accessToken)) form.reset()
  }
  return <section>
    <h2>Guruhlar</h2>
    <button disabled={!accessToken || entry.loading || entry.saving}
      onClick={() => { if (accessToken) void load(serverId, null, accessToken) }}>Guruhlarni yangilash</button>
    <GroupFeedback entry={entry} />
    {!entry.loading && !entry.error && !entry.groups.length && <p>Kirish mumkin bo‘lgan guruhlar yo‘q.</p>}
    <ul>{entry.groups.map((group) => <li key={group.id}>
      <Link href={`/servers/${encodeURIComponent(serverId)}/groups/${encodeURIComponent(group.id)}`}>{group.name}</Link>
      <p>Guruh ID: {group.id}</p><p>A’zolar soni: {group._count.members}</p>
    </li>)}</ul>
    {user?.id === ownerId && <form onSubmit={submit}>
      <fieldset disabled={entry.saving || entry.loading}>
        <legend>Guruh yaratish</legend>
        <label htmlFor="group-name">Guruh nomi</label>
        <input id="group-name" name="name" required maxLength={100} />
        <button type="submit">Yaratish</button>
      </fieldset>
    </form>}
  </section>
}
