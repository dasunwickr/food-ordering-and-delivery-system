"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import Cookies from 'js-cookie'

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
      
      // Store authentication data in both localStorage and cookies
      if (result.token) {
        localStorage.setItem('authToken', result.token)
        localStorage.setItem('userId', result.userId)
        localStorage.setItem('sessionId', result.sessionId)
        
        // Also set cookies for middleware
        Cookies.set('authToken', result.token, { expires: 7 })
        Cookies.set('userId', result.userId, { expires: 7 })
        Cookies.set('sessionId', result.sessionId, { expires: 7 })
      }
      
      // Get user type from response and store it
      const userType = result.userType
      console.log('User type from login:', userType)
      
      if (userType) {
        // Store user type in standardized lowercase format
        const normalizedUserType = userType.toLowerCase()
        localStorage.setItem('userType', normalizedUserType)
        Cookies.set('userType', normalizedUserType, { expires: 7 })
        
        // Show success message
        toast.success("Successfully signed in!", {
          description: `Welcome back to our food ordering platform.`,
        })
        
        // Redirect based on normalized user type
        console.log('Redirecting to:', `/${normalizedUserType}`)
        
        switch(normalizedUserType) {
          case 'admin':
            router.push("/admin")
            break
          case 'customer':
            router.push("/customer")
            break
          case 'restaurant':
            router.push("/restaurant")
            break
          case 'driver':
            router.push("/driver")
            break
          default:
            console.log('No matching user type, redirecting to dashboard')
            router.push("/dashboard")
        }
      } else {
        // No user type found
        console.log('No user type found, redirecting to dashboard')
        localStorage.setItem('userType', 'customer') // Default to customer if no type
        Cookies.set('userType', 'customer', { expires: 7 })
        
        toast.success("Successfully signed in!", {
          description: "Welcome back to our food ordering platform.",
        })
        
        router.push("/dashboard")
      }
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
