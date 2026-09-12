import type { ChildProps } from "@/types/props"
import { AuthBoundary } from "@/components/auth/auth-boundary"
import { SessionPanel } from "@/components/auth/session-panel"

export default function AppLayout({ children }: ChildProps) {
  return <AuthBoundary><SessionPanel />{children}</AuthBoundary>
}
