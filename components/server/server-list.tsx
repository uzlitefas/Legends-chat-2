"use client"

import { useEffect } from "react"
import Link from "next/link"
import { useAuthStore } from "@/stores/use-auth-store"
import { useServerStore } from "@/stores/use-server-store"
import { CreateServerForm } from "./create-server-form"

export function ServerList() {
  const token = useAuthStore((state) => state.accessToken)
  const { servers, loadMine, isListLoading, isSaving, listError } = useServerStore()
  useEffect(() => { if (token) void loadMine(token) }, [token, loadMine])

  return <main>
    <h1>Serverlarim</h1>
    <button disabled={!token || isListLoading || isSaving} onClick={() => { if (token) void loadMine(token) }}>
      Qayta yuklash
    </button>
    {isListLoading && <p role="status">Yuklanmoqda...</p>}
    {listError && <p role="alert">{listError}</p>}
    {!isListLoading && !listError && servers.length === 0 && <p>Siz a’zo bo‘lgan serverlar yo‘q.</p>}
    <ul>{servers.map((server) => <li key={server.id}>
      <Link href={`/servers/${encodeURIComponent(server.id)}`}>{server.name}</Link>
      <p>ID: {server.id}</p>
      <p>Ega ID: {server.ownerId}</p>
      <p>A’zolar soni: {server._count.members}</p>
    </li>)}</ul>
    <CreateServerForm />
  </main>
}
