import { apiRequest } from "@/service/api"

import type { AuthCredentials, AuthResponse, LogoutResponse } from "@/type/auth-type/authtype"
export type { AuthCredentials, AuthResponse, LogoutResponse } from "@/type/auth-type/authtype"

export const authService = {
  login(credentials: AuthCredentials): Promise<AuthResponse> {
    return apiRequest<AuthResponse>("auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    })
  },

  register(credentials: AuthCredentials): Promise<AuthResponse> {
    return apiRequest<AuthResponse>("auth/register", {
      method: "POST",
      body: JSON.stringify(credentials),
    })
  },

  refresh(): Promise<AuthResponse> {
    return apiRequest<AuthResponse>("auth/refresh", { method: "POST" })
  },

  async logout(sessionId: string, accessToken: string): Promise<LogoutResponse> {
    if (!sessionId.trim()) {
      throw new Error("Session ID talab qilinadi")
    }

    if (!accessToken.trim()) throw new Error("Access token talab qilinadi")

    return apiRequest<LogoutResponse>("auth/logout", {
      method: "POST",
      headers: { "x-session-id": sessionId, Authorization: `Bearer ${accessToken}` },
    })
  },

  async logoutAll(accessToken: string): Promise<LogoutResponse> {
    if (!accessToken.trim()) {
      throw new Error("Access token talab qilinadi")
    }

    return apiRequest<LogoutResponse>("auth/logout-all", {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}` },
    })
  },
}
