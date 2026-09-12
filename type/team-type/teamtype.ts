export type Team = {
  id: string
  serverId: string
  groupId: string
  name: string
  createdAt: string
  updatedAt: string
}
export type CreateTeamPayload = { name: string }
export type TeamEntry = {
  isSaving: boolean
  error: string | null
  createdTeam: Team | null
}
export type TeamStore = {
  entries: Record<string, TeamEntry>
  clear: () => void
  createTeam: (serverId: string, groupId: string, payload: CreateTeamPayload, token: string) => Promise<boolean>
}
