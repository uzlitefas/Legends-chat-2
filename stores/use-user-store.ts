"use client"

import { create } from "zustand"

import type { User } from "@/type/user-type/usertype"

type UserState = {
  user: User | null
  isLoading: boolean
  error: string | null
}

type UserActions = {
  setUser: (user: User) => void
  clearUser: () => void
  setLoading: (isLoading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
}

const initialState: UserState = {
  user: null,
  isLoading: false,
  error: null,
}

export const useUserStore = create<UserState & UserActions>()((set) => ({
  ...initialState,
  setUser: (user) => set({ user, isLoading: false, error: null }),
  clearUser: () => set(initialState),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
}))
