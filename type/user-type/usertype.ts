import type { AccountType } from "@/type/auth-type/authtype"

export type UserRole = "USER" | "ADMIN_MEMBER" | "ADMIN" | "SUPER_ADMIN"
export type UserStatus = "online" | "offline" | "idle" | "dnd"

export type UserIdParam = {
  id: string
}

export type UpdateUserPayload = {
  username?: string | null
  firstname?: string | null
  lastname?: string | null
  title?: string | null
  bio?: string | null
  nikname?: string | null
  textstatus?: string | null
  note?: string | null
  age?: number | null
  avatar?: string | null
  banner?: string | null
  status?: UserStatus
  email?: string
  phonenuber?: string | null
  googleemail?: string | null
  githubemail?: string | null
  bestfriends?: string[]
}

export type UpdateUserSettingsPayload = {
  roles?: UserRole[]
  premium?: boolean
}

export type UserProfile = {
  accountType: AccountType
  id: string
  username: string | null
  firstname: string | null
  lastname: string | null
  age: number | null
  roles: UserRole[]
  avatar: string | null
  banner: string | null
  status: UserStatus
  title: string | null
  bio: string | null
  nikname: string | null
  textstatus: string | null
  premium: boolean
  createdAt: string
  updatedAt: string
}

export type User = UserProfile & {
  assignedServerId: string | null
  defaultServerId: string | null
  email: string
  phonenuber: string | null
  googleemail: string | null
  githubemail: string | null
  note: string | null
  bestfriends: string[]
}

// PATCH javobida defaultServerId yo'q; GET /me javobida bor.
export type UserWriteResponse = Omit<User, "defaultServerId">

export type UserState = {
  user: User | null
  profile: UserProfile | null
  isLoading: boolean
  error: string | null
  message: string | null
}

export type UserActions = {
  setUser: (user: User) => void
  clearUser: () => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
  loadMe: (token: string) => Promise<boolean>
  loadProfile: (id: string, token: string) => Promise<boolean>
  updateMe: (payload: UpdateUserPayload, token: string) => Promise<boolean>
  updateSettings: (id: string, payload: UpdateUserSettingsPayload, token: string) => Promise<boolean>
  updatePremium: (id: string, premium: boolean, token: string) => Promise<boolean>
}
