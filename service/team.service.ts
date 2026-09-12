import { apiRequest } from "@/service/api"
import type { CreateTeamPayload, Team } from "@/type/team-type/teamtype"

export const teamService = {
  async create(serverId: string, groupId: string, payload: CreateTeamPayload, token: string): Promise<Team> {
    if (![serverId, groupId].every((id) => /^[A-Za-z0-9_-]{1,64}$/.test(id))) {
      throw new Error("Server yoki guruh ID noto'g'ri")
    }
    if (!token.trim()) throw new Error("Access token talab qilinadi")
    const name = payload.name.trim()
    if (!name || name.length > 100) throw new Error("Team nomi 1–100 belgi bo'lishi kerak")
    return apiRequest<Team>(`servers/${encodeURIComponent(serverId)}/groups/${encodeURIComponent(groupId)}/teams`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ name }),
    })
  },
}
