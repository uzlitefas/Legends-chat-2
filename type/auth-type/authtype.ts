import type { UserRole } from "@/type/user-type/usertype"

export type AccountType = "REGULAR" | "SERVER_USER"
export type AuthCredentials = { email: string; password: string }
export type AuthUser = {
  id: string
  email: string
  role: UserRole
  accountType: AccountType
  assignedServerId: string | null
  defaultServerId: string | null
}
export type AuthResponse = { accessToken: string; sessionId: string; user: AuthUser }
export type LogoutResponse = { success: boolean }
export type AuthState = {
  accessToken: string | null
  sessionId: string | null
  user: AuthUser | null
  isAuthenticated: boolean
  isInitialized: boolean
  isLoading: boolean
  error: string | null
}
export type AuthActions = {
  setAuth: (session: AuthResponse) => void
  clearAuth: () => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
  initialize: () => Promise<void>
  login: (credentials: AuthCredentials) => Promise<boolean>
  register: (credentials: AuthCredentials) => Promise<boolean>
  refresh: () => Promise<boolean>
  logout: (all?: boolean) => Promise<boolean>
}
