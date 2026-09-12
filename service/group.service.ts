import { apiRequest } from "@/service/api"
import type { AddGroupMemberPayload, CreateGroupPayload, GroupAccess, GroupDetails, GroupMember, GroupSummary, RemoveGroupMemberResponse, UpdateGroupAccessPayload, UpdateGroupAccessResponse } from "@/type/group-type/grouptype"

function id(value: string) {
  if (!/^[A-Za-z0-9_-]{1,64}$/.test(value)) throw new Error("ID noto'g'ri")
  return encodeURIComponent(value)
}
function path(serverId: string, groupId?: string) {
  return `servers/${id(serverId)}/groups${groupId === undefined ? "" : `/${id(groupId)}`}`
}
function headers(token: string) {
  if (!token.trim()) throw new Error("Access token talab qilinadi")
  return { Authorization: `Bearer ${token}` }
}
export const groupService = {
  async list(serverId: string, token: string): Promise<GroupSummary[]> {
    return apiRequest(path(serverId), { headers: headers(token) })
  },
  async get(serverId: string, groupId: string, token: string): Promise<GroupDetails> {
    return apiRequest(path(serverId, groupId), { headers: headers(token) })
  },
  async create(serverId: string, payload: CreateGroupPayload, token: string): Promise<GroupSummary> {
    const name = payload.name.trim()
    if (!name || name.length > 100) throw new Error("Guruh nomi 1–100 belgi bo'lishi kerak")
    return apiRequest(path(serverId), { method: "POST", headers: headers(token), body: JSON.stringify({ name }) })
  },
  async addMember(serverId: string, groupId: string, payload: AddGroupMemberPayload, token: string): Promise<GroupMember> {
    id(payload.userId)
    return apiRequest(`${path(serverId, groupId)}/members`, {
      method: "POST", headers: headers(token), body: JSON.stringify({ userId: payload.userId }),
    })
  },
  async removeMember(serverId: string, groupId: string, userId: string, token: string): Promise<RemoveGroupMemberResponse> {
    return apiRequest(`${path(serverId, groupId)}/members/${id(userId)}`, { method: "DELETE", headers: headers(token) })
  },
  async settings(serverId: string, groupId: string, token: string): Promise<GroupAccess[]> {
    return apiRequest(`${path(serverId, groupId)}/settings`, { headers: headers(token) })
  },
  async updateAccess(serverId: string, groupId: string, userId: string, payload: UpdateGroupAccessPayload, token: string): Promise<UpdateGroupAccessResponse> {
    return apiRequest(`${path(serverId, groupId)}/settings/members/${id(userId)}`, {
      method: "PATCH", headers: headers(token), body: JSON.stringify({ canEnter: payload.canEnter }),
    })
  },
}
