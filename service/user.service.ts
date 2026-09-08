import { apiRequest } from "@/service/api"
import type { UpdateUserPayload, UpdateUserSettingsPayload, User, UserProfile } from "@/type/user-type/usertype"

export type { User, UserProfile, UserRole, UserStatus, UpdateUserPayload, UpdateUserSettingsPayload } from "@/type/user-type/usertype"

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

