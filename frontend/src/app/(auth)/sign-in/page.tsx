"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { AuthHeader } from "@/components/auth/auth-header"
import { SignInForm } from "@/components/auth/sign-in-form"
import { userService } from "@/services/user-service"

export default function SignIn() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSignIn = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      // Call the login function from userService
      const result = await userService.login(email, password)
      
      // Show success message
      toast.success("Successfully signed in!", {
        description: "Welcome back to our food ordering platform.",
      })
      
      // Redirect to appropriate dashboard based on user type
      // We can enhance this later with a proper role-based routing
      router.push("/dashboard")
      
    } catch (error: any) {
      // Show error message
      const errorMessage = error.response?.data?.message || "Failed to sign in. Please try again."
      toast.error("Authentication failed", {
        description: errorMessage,
      })
      console.error("Login error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <AuthHeader title="Welcome back" subtitle="Sign in to your account to continue" />
      <SignInForm onSubmit={handleSignIn} isLoading={isLoading} />
    </>
  )
}
