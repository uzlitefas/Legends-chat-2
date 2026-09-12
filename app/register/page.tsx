import { AuthBoundary } from "@/components/auth/auth-boundary"
import { AuthForm } from "@/components/auth/auth-form"

export default function RegisterPage() {
  return <AuthBoundary guest><AuthForm mode="register" /></AuthBoundary>
}
