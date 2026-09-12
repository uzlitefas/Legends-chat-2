import { AuthBoundary } from "@/components/auth/auth-boundary"
import { LoginForm } from "./_components/login-form"

export default function LoginPage() {
  return <AuthBoundary guest><LoginForm /></AuthBoundary>
}
