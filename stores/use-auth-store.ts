"use client"

import { create } from "zustand"
import { ApiError } from "@/service/api"
import { authService } from "@/service/auth.service"
import { useUserStore } from "@/stores/use-user-store"
import type { AuthActions, AuthResponse, AuthState } from "@/type/auth-type/authtype"

const initialState: AuthState = {
  accessToken: null,
  sessionId: null,
  user: null,
  isAuthenticated: false,
  isInitialized: false,
  isLoading: false,
  error: null,
}

const errorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "So'rov bajarilmadi"

// Bir nechta component bir vaqtda refresh cookie-ni aylantirmaydi.
let initialization: Promise<void> | null = null

export const useAuthStore = create<AuthState & AuthActions>()((set, get) => {
  async function authenticate(request: () => Promise<AuthResponse>) {
    if (get().isLoading) return false
    set({ isLoading: true, error: null })
    try {
      get().setAuth(await request())
      return true
    } catch (error) {
      set({ isLoading: false, error: errorMessage(error) })
      return false
    }
  }

  return {
    ...initialState,
    setAuth: ({ accessToken, sessionId, user }) => {
      if (get().user?.id !== user.id) useUserStore.getState().clearUser()
      set({ accessToken, sessionId, user, isAuthenticated: true,
        isInitialized: true, isLoading: false, error: null })
    },
    clearAuth: () => {
      useUserStore.getState().clearUser()
      set({ ...initialState, isInitialized: true })
    },
    setLoading: (isLoading) => set({ isLoading }),
    setError: (error) => set({ error }),
    clearError: () => set({ error: null }),
    initialize: async () => {
      if (initialization) return initialization
      if (get().isInitialized) return
      initialization = (async () => {
        set({ isLoading: true, error: null })
        try {
          get().setAuth(await authService.refresh())
        } catch (error) {
          get().clearAuth()
          if (!(error instanceof ApiError && error.status === 401)) {
            set({ error: errorMessage(error) })
          }
        }
      })()
      try { await initialization } finally { initialization = null }
    },
    login: (credentials) => authenticate(() => authService.login(credentials)),
    register: (credentials) => authenticate(() => authService.register(credentials)),
    refresh: async () => {
      if (get().isLoading) return false
      set({ isLoading: true, error: null })
      try {
        get().setAuth(await authService.refresh())
        return true
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) get().clearAuth()
        set({ isLoading: false, error: errorMessage(error) })
        return false
      }
    },
    logout: async (all = false) => {
      if (get().isLoading) return false
      set({ isLoading: true, error: null })
      try {
        const send = () => {
          const { accessToken, sessionId } = get()
          if (!accessToken || !sessionId) throw new Error("Avval tizimga kiring")
          return all ? authService.logoutAll(accessToken) : authService.logout(sessionId, accessToken)
        }
        try {
          await send()
        } catch (error) {
          if (!(error instanceof ApiError && error.status === 401)) throw error
          // Refresh yangi sessionId beradi; chiqishda o'sha ID ishlatiladi.
          const session = await authService.refresh()
          set({ accessToken: session.accessToken, sessionId: session.sessionId, user: session.user })
          await send()
        }
        get().clearAuth()
        return true
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) get().clearAuth()
        set({ isLoading: false, error: errorMessage(error) })
        return false
      }
    },
  }
})
