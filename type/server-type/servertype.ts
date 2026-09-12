import type { AccountType } from "@/type/auth-type/authtype"
import type { UserStatus } from "@/type/user-type/usertype"

export type Server = {
  id: string
  name: string
  ownerId: string
  createdAt: string
  updatedAt: string
}

export type ServerSummary = Server & { _count: { members: number } }

export type ServerMember = {
  userId: string
  joinedAt: string
  user: {
    id: string
    username: string | null
    firstname: string | null
    lastname: string | null
    avatar: string | null
    status: UserStatus
    accountType: AccountType
  }
}

export type ServerDetails = Server & { members: ServerMember[] }
export type CreateServerPayload = { name: string; ownerId: string }
export type UpdateServerSettingsPayload = { name: string }

export type ServerState = {
  servers: ServerSummary[]
  server: ServerDetails | null
  createdServer: ServerSummary | null
  isListLoading: boolean
  isDetailLoading: boolean
  isSaving: boolean
  listError: string | null
  detailError: string | null
  saveError: string | null
  message: string | null
}

export type ServerActions = {
  clear: () => void
  loadMine: (token: string) => Promise<void>
  loadOne: (id: string, token: string) => Promise<void>
  createServer: (payload: CreateServerPayload, token: string, actorId: string) => Promise<boolean>
  updateSettings: (id: string, payload: UpdateServerSettingsPayload, token: string) => Promise<boolean>
}
