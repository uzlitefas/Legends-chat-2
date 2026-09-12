import { apiRequest } from "@/service/api"
import type { CreateServerPayload, ServerDetails, ServerSummary, UpdateServerSettingsPayload } from "@/type/server-type/servertype"

function headers(token: string) {
  if (!token.trim()) throw new Error("Access token talab qilinadi")
  return { Authorization: `Bearer ${token}` }
}

function serverPath(id: string) {
  if (!/^[a-zA-Z0-9_-]{1,64}$/.test(id)) throw new Error("Server ID noto'g'ri")
  return `servers/${encodeURIComponent(id)}`
}

function serverName(name: string) {
  const value = name.trim()
  if (!value || value.length > 100) throw new Error("Server nomi 1–100 belgi bo'lishi kerak")
  return value
}

export const serverService = {
  async getMine(token: string): Promise<ServerSummary[]> {
    return apiRequest<ServerSummary[]>("servers", { headers: headers(token) })
  },
  async getOne(id: string, token: string): Promise<ServerDetails> {
    return apiRequest<ServerDetails>(serverPath(id), { headers: headers(token) })
  },
  async create(payload: CreateServerPayload, token: string): Promise<ServerSummary> {
    if (!/^[a-zA-Z0-9_-]{1,64}$/.test(payload.ownerId)) throw new Error("Egasining User ID qiymati noto'g'ri")
    return apiRequest<ServerSummary>("servers", {
      method: "POST", headers: headers(token),
      body: JSON.stringify({ name: serverName(payload.name), ownerId: payload.ownerId }),
    })
  },
  async updateSettings(id: string, payload: UpdateServerSettingsPayload, token: string): Promise<ServerSummary> {
    return apiRequest<ServerSummary>(`${serverPath(id)}/settings`, {
      method: "PATCH", headers: headers(token),
      body: JSON.stringify({ name: serverName(payload.name) }),
    })
  },
}
