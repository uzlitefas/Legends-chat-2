import type { AuthUser } from "@/type/auth-type/authtype"

export function authHome(user: AuthUser | null) {
  return user?.defaultServerId
    ? `/servers/${encodeURIComponent(user.defaultServerId)}`
    : "/"
}
