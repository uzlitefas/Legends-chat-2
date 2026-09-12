"use client"

import Link from "next/link"
import type { FormEvent } from "react"
import { useAuthStore } from "@/stores/use-auth-store"

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const { login, register, isLoading, error, clearError } = useAuthStore()
  const registering = mode === "register"

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)
    const credentials = {
      email: String(data.get("email") ?? "").trim().toLowerCase(),
      password: String(data.get("password") ?? ""),
    }
    const success = await (registering ? register(credentials) : login(credentials))
    if (success) form.reset()
  }

  return (
    <form onSubmit={submit}>
      <h1>{registering ? "Ro'yxatdan o'tish" : "Kirish"}</h1>
      <fieldset disabled={isLoading}>
        <div>
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" autoComplete="email" maxLength={255} required />
        </div>
        <div>
          <label htmlFor="password">Parol</label>
          <input id="password" name="password" type="password" minLength={8} maxLength={100}
            autoComplete={registering ? "new-password" : "current-password"} required />
        </div>
        <button type="submit">{isLoading ? "Kutilmoqda..." : registering ? "Ro'yxatdan o'tish" : "Kirish"}</button>
      </fieldset>
      {error && <p role="alert">{error}</p>}
      <Link href={registering ? "/login" : "/register"} onClick={clearError}>
        {registering ? "Kirish" : "Ro'yxatdan o'tish"}
      </Link>
    </form>
  )
}
