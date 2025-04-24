"use client"

import { AuthHeader } from "@/components/auth/auth-header"
import { SignInForm } from "@/components/auth/sign-in-form"

export default function SignIn() {
  const handleSignIn = (email: string, password: string) => {
    console.log("Sign in with:", email, password)
  }

  return (
    <>
      <AuthHeader title="Welcome back" subtitle="Sign in to your account to continue" />
      <SignInForm onSubmit={handleSignIn} />
    </>
  )
}
