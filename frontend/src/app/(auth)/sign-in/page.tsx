"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"

import { AuthHeader } from "@/components/auth/auth-header"
import { SignInForm } from "@/components/auth/sign-in-form"
import { userService } from "@/services/user-service"
import { googleSignIn } from "@/services/auth-service"

export default function SignIn() {
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  // Check if there's Google authentication data in the URL (redirected from sign-up)
  useEffect(() => {
    const googleRedirect = searchParams.get('googleRedirect')
    const googleAuth = searchParams.get('googleAuth')
    
    if (googleRedirect === 'true' && googleAuth) {
      try {
        const googleData = JSON.parse(decodeURIComponent(googleAuth))
        if (googleData) {
          toast.info("Completing Google sign-in...")
          handleGoogleSignIn(googleData)
        }
      } catch (error) {
        console.error("Error parsing Google auth data from URL:", error)
      }
    }
  }, [searchParams])

  const handleSignIn = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      // Call the login function from userService
      const result = await userService.login(email, password)
      
      // Get user type from response
      const userType = result.userType
      console.log('User type from login:', userType)
      
      if (userType) {
        // User type is already normalized to lowercase in the login function
        
        // Show success message
        toast.success("Successfully signed in!", {
          description: `Welcome back to our food ordering platform.`,
        })
        
        // Redirect based on user type
        console.log('Redirecting to:', `/${userType}`)
        
        // Direct routing based on user type
        router.push(`/${userType}`)
      } else {
        // No user type found
        console.log('No user type found, redirecting to dashboard')
        
        toast.success("Successfully signed in!", {
          description: "Welcome back to our food ordering platform.",
        })
        
        router.push("/dashboard")
      }
    } catch (error: any) {
      // Show error message
      const errorMessage = error.response?.data?.message || error.message || "Failed to sign in. Please try again."
      toast.error("Authentication failed", {
        description: errorMessage,
      })
      console.error("Login error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async (googleData: any) => {
    setIsGoogleLoading(true)
    try {
      // First check if this is a new user that needs to sign up
      if (googleData.newUser) {
        // Redirect to sign-up with Google data
        router.push(`/sign-up?googleAuth=${encodeURIComponent(JSON.stringify(googleData))}`)
        return
      }
      
      // Try to sign in with Google
      const result = await googleSignIn(googleData)
      
      // If no token but error indicates user doesn't exist
      if (!result.token && result.error && result.error.includes("No account found")) {
        toast.info("Account not found", {
          description: "Let's set up your account with Google.",
        })
        // Redirect to sign-up with Google data
        router.push(`/sign-up?googleAuth=${encodeURIComponent(JSON.stringify(googleData))}`)
        return
      }
      
      // If successful login
      if (result.token) {
        // Get user type from response
        const userType = result.userType
        console.log('User type from Google login:', userType)
        
        if (userType) {
          // Show success message
          toast.success("Successfully signed in with Google!", {
            description: `Welcome to our food ordering platform.`,
          })
          
          // Redirect based on user type
          router.push(`/${userType}`)
        } else {
          // No user type found
          console.log('No user type found, redirecting to dashboard')
          
          toast.success("Successfully signed in with Google!", {
            description: "Welcome to our food ordering platform.",
          })
          
          router.push("/dashboard")
        }
      } else {
        // Handle other error cases
        toast.error("Google sign-in failed", {
          description: result.error || "Unable to sign in with Google. Please try again.",
        })
      }
    } catch (error: any) {
      // If the email is not registered, redirect to sign-up with Google data
      if (error.response?.status === 404 || 
          error.message?.includes('not registered') || 
          error.message?.includes('not found') ||
          error.message?.includes('No account found')) {
        toast.info("Google account not recognized", {
          description: "We'll set up an account for you.",
        })
        
        // Pass Google data to sign-up flow
        router.push(`/sign-up?googleAuth=${encodeURIComponent(JSON.stringify(googleData))}`)
        return
      }
      
      // Handle other errors
      const errorMessage = error.response?.data?.message || error.message || "Failed to sign in with Google. Please try again."
      toast.error("Google authentication failed", {
        description: errorMessage,
      })
      console.error("Google login error:", error)
    } finally {
      setIsGoogleLoading(false)
    }
  }

  return (
    <>
      <AuthHeader title="Welcome back" subtitle="Sign in to your account to continue" />
      <SignInForm 
        onSubmit={handleSignIn} 
        onGoogleSignIn={handleGoogleSignIn}
        isLoading={isLoading || isGoogleLoading} 
      />
    </>
  )
}
