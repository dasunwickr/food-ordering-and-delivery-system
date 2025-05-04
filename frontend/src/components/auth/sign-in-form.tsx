"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight, Mail, Loader2, AlertCircle, ShieldAlert } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { FormInput } from "./form-input"
import { PasswordInput } from "./password-input"
import { SocialSignIn } from "./sign-up/social-sign-in"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { checkEmailExists } from "@/services/auth-service"

interface SignInFormProps {
  onSubmit: (email: string, password: string) => void
  isLoading?: boolean
}

export function SignInForm({ onSubmit, isLoading = false }: SignInFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})
  const [serviceError, setServiceError] = useState<string | null>(null)
  const [isCredentialError, setIsCredentialError] = useState(false)
  const [isCheckingEmail, setIsCheckingEmail] = useState(false)
  const [emailNotRegistered, setEmailNotRegistered] = useState(false)
  const [emailDebounceTimer, setEmailDebounceTimer] = useState<NodeJS.Timeout | null>(null)
  
  // Use stable IDs for form elements to prevent hydration mismatches
  const emailFieldId = "signin-email"
  const passwordFieldId = "signin-password"

  // Check email existence when email changes, with debounce
  useEffect(() => {
    // Clear any existing timer
    if (emailDebounceTimer) {
      clearTimeout(emailDebounceTimer)
    }

    // Reset email not registered state when email changes
    setEmailNotRegistered(false)

    // Reset credential error state when email or password changes
    setIsCredentialError(false)
    setServiceError(null)

    // Don't validate empty, invalid or short emails
    if (!email || !/\S+@\S+\.\S+/.test(email) || email.length < 5) {
      return
    }

    // Set a new timer to check after 600ms of no typing
    const timer = setTimeout(async () => {
      try {
        setIsCheckingEmail(true)
        const result = await checkEmailExists(email)
        
        if (!result.exists && !result.error) {
          setEmailNotRegistered(true)
        } else {
          setEmailNotRegistered(false)
        }
      } catch (error) {
        console.error("Email validation error:", error)
      } finally {
        setIsCheckingEmail(false)
      }
    }, 600)
    
    setEmailDebounceTimer(timer)
    
    // Cleanup function to clear the timeout if the component unmounts
    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [email])

  // Clear credential error when password changes
  useEffect(() => {
    setIsCredentialError(false)
    setServiceError(null)
  }, [password])

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {}

    if (!email) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email is invalid"
    }

    if (!password) {
      newErrors.password = "Password is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Clear any previous service errors
    setServiceError(null)
    setIsCredentialError(false)
    
    if (validateForm()) {
      try {
        // Call the provided onSubmit function with email and password
        await onSubmit(email, password)
        // Redirection is now handled in the parent component
      } catch (error: any) {
        // Handle login errors more gracefully
        console.error("Login error:", error)
        const errorMessage = error?.message || "Unable to sign in. Please check your credentials or try again later."
        
        // Check if it's likely a credentials error
        const isCredentials = /invalid credentials|incorrect password|authentication failed|wrong password|user not found/i.test(errorMessage.toLowerCase())
        
        setIsCredentialError(isCredentials)
        setServiceError(isCredentials ? 
          "Invalid email or password. Please try again." : 
          errorMessage
        )
        
        // Show error toast notification using Sonner
        toast.error(
          isCredentials ? 
            "Invalid credentials" : 
            "Authentication Error", 
          {
            description: isCredentials ? 
              "Please check your email and password and try again." : 
              errorMessage,
            icon: isCredentials ? "🔒" : "⚠️",
            position: "top-center",
            duration: 4000,
          }
        )
      }
    } else {
      // Show validation error toast
      if (errors.email) {
        toast.error("Email Error", {
          description: errors.email,
          icon: "✉️"
        })
      }
      
      if (errors.password) {
        toast.error("Password Error", {
          description: errors.password,
          icon: "🔑"
        })
      }
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24,
      },
    },
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {serviceError && (
        <motion.div
          variants={itemVariants}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Alert 
            variant={isCredentialError ? "destructive" : "default"} 
            className={`mb-6 border-2 ${isCredentialError ? "bg-red-50 border-red-300" : ""}`}
          >
            {isCredentialError ? 
              <ShieldAlert className="h-5 w-5 text-red-500" /> : 
              <AlertCircle className="h-4 w-4" />
            }
            <AlertDescription className={`ml-2 ${isCredentialError ? "font-medium" : ""}`}>
              {serviceError}
              {isCredentialError && (
                <div className="mt-1 text-sm font-normal text-muted-foreground">
                  Check your email and password and try again
                </div>
              )}
            </AlertDescription>
          </Alert>
        </motion.div>
      )}
      
      <motion.div variants={itemVariants}>
        <FormInput
          id={emailFieldId}
          label="Email"
          type="email"
          placeholder="name@example.com"
          value={email}
          onChange={setEmail}
          error={errors.email}
          icon={<Mail className="h-4 w-4" />}
          disabled={isLoading || isCheckingEmail}
          hasError={isCredentialError}
        />
        {emailNotRegistered && (
          <div className="mt-2 flex items-center text-sm text-amber-500">
            <AlertCircle className="mr-1 h-4 w-4" />
            <span>This email is not registered. <Link href="/sign-up" className="underline font-medium">Sign up?</Link></span>
          </div>
        )}
        {isCheckingEmail && !emailNotRegistered && (
          <div className="mt-2 flex items-center text-xs text-muted-foreground">
            <span className="animate-pulse">Checking email...</span>
          </div>
        )}
      </motion.div>

      <motion.div variants={itemVariants}>
        <div className="flex justify-between">
          <label htmlFor={passwordFieldId} className="text-sm font-medium">
            Password
          </label>
          <Link href="/forgot-password" className="text-sm text-primary hover:underline">
            Forgot Password?
          </Link>
        </div>
        <div className="relative">
          <PasswordInput 
            id={passwordFieldId} 
            label="" 
            value={password} 
            onChange={setPassword} 
            error={errors.password} 
            disabled={isLoading}
            hasError={isCredentialError}
          />
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Button 
          type="submit" 
          className="w-full" 
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing In...
            </>
          ) : (
            <>
              Sign In
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </motion.div>

      <motion.div variants={itemVariants}>
        <SocialSignIn onGoogleSignIn={() => console.log("Google sign in")} />
      </motion.div>

      <motion.div className="text-center text-sm" variants={itemVariants}>
        Don&apos;t have an account?{" "}
        <Link href="/sign-up" className="text-primary font-medium hover:underline">
          Sign Up
        </Link>
      </motion.div>
    </motion.form>
  )
}
