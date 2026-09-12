"use client"

import { create } from "zustand"
import { userService } from "@/service/user.service"
import { premiumService } from "@/service/premium.service"
import type { User, UserActions, UserState } from "@/type/user-type/usertype"

const initialState: UserState = {
  user: null, profile: null, isLoading: false, error: null, message: null,
}

// Logoutdan keyin eski so'rov natijasi storega qaytib yozilmaydi.
let generation = 0

export const useUserStore = create<UserState & UserActions>()((set, get) => {
  async function run<T>(request: () => Promise<T>, apply: (result: T) => void, message: string | null = null) {
    if (get().isLoading) return false
    const current = generation
    set({ isLoading: true, error: null, message: null })
    try {
      const result = await request()
      if (current !== generation) return false
      apply(result)
      set({ isLoading: false, message })
      return true
    } catch (error) {
      if (current !== generation) return false
      set({ isLoading: false, error: error instanceof Error ? error.message : "So'rov bajarilmadi" })
      return false
    }
  }

  function mergeUser(user: User) {
    set((state) => ({
      user: state.user?.id === user.id ? user : state.user,
      profile: state.profile?.id === user.id ? user : state.profile,
    }))
  }

  return {
    ...initialState,
    setUser: (user) => set({ user, isLoading: false, error: null }),
    clearUser: () => { generation += 1; set(initialState) },
    setLoading: (isLoading) => set({ isLoading }),
    setError: (error) => set({ error, message: null }),
    clearError: () => set({ error: null, message: null }),
    loadMe: (token) => run(() => userService.getMe(token), (user) => set({ user })),
    loadProfile: (id, token) => {
      if (get().isLoading) return Promise.resolve(false)
      set({ profile: null })
      return run(() => userService.getProfile(id, token), (profile) => set({ profile }))
    },
    updateMe: (payload, token) => run(
      () => userService.updateMe(payload, token),
      (user) => { mergeUser(user); set({ user }) },
      "Profil saqlandi",
    ),
    updateSettings: (id, payload, token) => run(
      () => userService.updateSettings(id, payload, token),
      mergeUser,
      "Foydalanuvchi sozlamalari saqlandi",
    ),
    updatePremium: (id, premium, token) => run(
      () => premiumService.update(id, { premium }, token),
      (result) => set((state) => ({
        user: state.user?.id === result.id ? { ...state.user, premium: result.premium } : state.user,
        profile: state.profile?.id === result.id ? { ...state.profile, premium: result.premium } : state.profile,
      })),
      "Premium holati saqlandi",
    ),
  }
})
