import { apiRequest } from "@/service/api"

export type UserRole = "USER" | "ADMIN_MEMBER" | "ADMIN" | "SUPER_ADMIN"
export type UserStatus = "online" | "offline" | "idle" | "dnd"

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

export type UpdateUserPayload = Partial<Pick<User,
  | "username"
  | "firstname"
  | "lastname"
  | "age"
  | "avatar"
  | "banner"
  | "status"
  | "title"
  | "bio"
  | "nikname"
  | "textstatus"
  | "email"
  | "phonenuber"
  | "googleemail"
  | "githubemail"
  | "note"
  | "bestfriends"
>>

export type UpdateUserSettingsPayload = {
  roles?: UserRole[]
  premium?: boolean
}

function authHeaders(accessToken: string) {
  if (!accessToken.trim()) {
    throw new Error("Access token talab qilinadi")
  }

  return { Authorization: `Bearer ${accessToken}` }
}

function userPath(id: string) {
  if (!id.trim()) {
    throw new Error("User ID talab qilinadi")
  }

  return `users/${encodeURIComponent(id)}`
}

export const userService = {
  async getMe(accessToken: string): Promise<User> {
    return apiRequest<User>("users/me", {
      method: "GET",
      headers: authHeaders(accessToken),
    })
  },

  async updateMe(payload: UpdateUserPayload, accessToken: string): Promise<User> {
    return apiRequest<User>("users/me", {
      method: "PATCH",
      headers: authHeaders(accessToken),
      body: JSON.stringify(payload),
    })
  },

  async getProfile(id: string, accessToken: string): Promise<UserProfile> {
    return apiRequest<UserProfile>(userPath(id), {
      method: "GET",
      headers: authHeaders(accessToken),
    })
  },

  async updateSettings(
    id: string,
    payload: UpdateUserSettingsPayload,
    accessToken: string
  ): Promise<User> {
    return apiRequest<User>(`${userPath(id)}/settings`, {
      method: "PATCH",
      headers: authHeaders(accessToken),
      body: JSON.stringify(payload),
    })
  },
}
