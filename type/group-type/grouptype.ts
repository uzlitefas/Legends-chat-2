import type { ServerMember } from "@/type/server-type/servertype"

export type Group = { id: string; serverId: string; name: string; createdAt: string; updatedAt: string }
export type GroupSummary = Group & { _count: { members: number } }
export type GroupMember = {
  userId: string
  canEnter: boolean
  createdAt: string
  serverMember: { user: ServerMember["user"] }
}
export type GroupTeam = { id: string; serverId: string; groupId: string; name: string; createdAt: string; updatedAt: string }
export type GroupDetails = Group & { members: GroupMember[]; teams: GroupTeam[] }
export type GroupAccess = { userId: string; canEnter: boolean; updatedAt: string }
export type UpdateGroupAccessResponse = GroupAccess & { groupId: string }
export type CreateGroupPayload = { name: string }
export type AddGroupMemberPayload = { userId: string }
export type UpdateGroupAccessPayload = { canEnter: boolean }
export type RemoveGroupMemberResponse = { groupId: string; userId: string }

export type GroupEntry = {
  groups: GroupSummary[]
  group: GroupDetails | null
  settings: GroupAccess[] | null
  loading: boolean
  saving: boolean
  error: string | null
  settingsError: string | null
  message: string | null
}
export type GroupStore = {
  entries: Record<string, GroupEntry>
  clear: () => void
  load: (serverId: string, groupId: string | null, token: string, owner?: boolean) => Promise<void>
  createGroup: (serverId: string, name: string, token: string) => Promise<boolean>
  addMember: (serverId: string, groupId: string, userId: string, token: string) => Promise<boolean>
  removeMember: (serverId: string, groupId: string, userId: string, token: string) => Promise<boolean>
  setAccess: (serverId: string, groupId: string, userId: string, canEnter: boolean, token: string) => Promise<boolean>
}
