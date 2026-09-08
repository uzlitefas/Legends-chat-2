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
  email: string
  phonenuber: string | null
  googleemail: string | null
  githubemail: string | null
  note: string | null
  bestfriends: string[]
}
