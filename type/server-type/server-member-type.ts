export type AddServerMemberPayload = { userId: string }
export type RemoveServerMemberResponse = { serverId: string; userId: string }
export type CreateServerUserPayload = {
  email: string
  password: string
  username?: string
  firstname?: string
  lastname?: string
}
export type CreatedServerUser = {
  id: string
  email: string
  username: string | null
  firstname: string | null
  lastname: string | null
  accountType: "SERVER_USER"
  assignedServerId: string
  createdAt: string
}
export type ServerMemberState = {
  serverId: string | null
  isSaving: boolean
  error: string | null
  message: string | null
  createdUser: CreatedServerUser | null
}
export type ServerMemberActions = {
  clear: () => void
  addMember: (serverId: string, userId: string, token: string) => Promise<boolean>
  removeMember: (serverId: string, userId: string, token: string) => Promise<boolean>
  createUser: (serverId: string, payload: CreateServerUserPayload, token: string) => Promise<boolean>
}
