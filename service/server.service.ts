import { apiRequest } from "@/service/api"
import type { AddServerMemberPayload, CreateServerUserPayload, CreatedServerUser, RemoveServerMemberResponse } from "@/type/server-type/server-member-type"
import type { ServerMember } from "@/type/server-type/servertype"
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
  async addMember(id: string, payload: AddServerMemberPayload, token: string): Promise<ServerMember> {
    if (!/^[a-zA-Z0-9_-]{1,64}$/.test(payload.userId)) throw new Error("User ID noto'g'ri")
    return apiRequest<ServerMember>(`${serverPath(id)}/members`, {
      method: "POST", headers: headers(token), body: JSON.stringify({ userId: payload.userId }),
    })
  },
  async removeMember(id: string, userId: string, token: string): Promise<RemoveServerMemberResponse> {
    if (!/^[a-zA-Z0-9_-]{1,64}$/.test(userId)) throw new Error("User ID noto'g'ri")
    return apiRequest<RemoveServerMemberResponse>(`${serverPath(id)}/members/${encodeURIComponent(userId)}`, {
      method: "DELETE", headers: headers(token),
    })
  },
  async createUser(id: string, payload: CreateServerUserPayload, token: string): Promise<CreatedServerUser> {
    return apiRequest<CreatedServerUser>(`${serverPath(id)}/users`, {
      method: "POST", headers: headers(token),
      body: JSON.stringify({
        email: payload.email.trim().toLowerCase(), password: payload.password,
        username: payload.username?.trim().toLowerCase() || undefined,
        firstname: payload.firstname?.trim() || undefined,
        lastname: payload.lastname?.trim() || undefined,
      }),
    })
  },
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
