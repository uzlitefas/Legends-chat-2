"use client"

import { create } from "zustand"

type AuthSession = {
  accessToken: string
  sessionId: string
}

type AuthState = {
  accessToken: string | null
  sessionId: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

type AuthActions = {
  setAuth: (session: AuthSession) => void
  clearAuth: () => void
  setLoading: (isLoading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
}

const initialState: AuthState = {
  accessToken: null,
  sessionId: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
}

export const useAuthStore = create<AuthState & AuthActions>()((set) => ({
  ...initialState,
  setAuth: ({ accessToken, sessionId }) =>
    set({ accessToken, sessionId, isAuthenticated: true, isLoading: false, error: null }),
  clearAuth: () => set(initialState),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
}))
