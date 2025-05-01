"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight, Mail, Loader2, AlertCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { FormInput } from "./form-input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { checkEmailExists } from "@/services/auth-service"

interface ForgotPasswordFormProps {
  onSubmit: (email: string) => void
  isLoading?: boolean
}

export function ForgotPasswordForm({ onSubmit, isLoading = false }: ForgotPasswordFormProps) {
  const [email, setEmail] = useState("")
  const [errors, setErrors] = useState<{ email?: string }>({})
  const [serviceError, setServiceError] = useState<string | null>(null)
  const [isCheckingEmail, setIsCheckingEmail] = useState(false)
  const [emailNotRegistered, setEmailNotRegistered] = useState(false)
  const [emailDebounceTimer, setEmailDebounceTimer] = useState<NodeJS.Timeout | null>(null)

  // Check email existence when email changes, with debounce
  useEffect(() => {
    // Clear any existing timer
    if (emailDebounceTimer) {
      clearTimeout(emailDebounceTimer)
    }

    // Reset email not registered state when email changes
    setEmailNotRegistered(false)

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

  const validateForm = () => {
    const newErrors: { email?: string } = {}

    if (!email) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email is invalid"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Clear any previous service errors
    setServiceError(null)

    if (validateForm()) {
      // Double-check email existence before submitting
      try {
        setIsCheckingEmail(true)
        const result = await checkEmailExists(email)
        
        if (!result.exists) {
          setEmailNotRegistered(true)
          setIsCheckingEmail(false)
          return
        }
        
        // If email exists, proceed with submission
        onSubmit(email)
      } catch (error: any) {
        console.error("Forgot password error:", error)
        const errorMessage = error?.message || "Unable to process your request. Please try again later."
        setServiceError(errorMessage)
      } finally {
        setIsCheckingEmail(false)
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
        <motion.div variants={itemVariants}>
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="ml-2">{serviceError}</AlertDescription>
          </Alert>
        </motion.div>
      )}

      <motion.div variants={itemVariants} className="space-y-2">
        <h2 className="text-2xl font-bold">Reset Password</h2>
        <p className="text-sm text-muted-foreground">
          Enter your email address and we&apos;ll send you a code to reset your password.
        </p>
      </motion.div>
      
      <motion.div variants={itemVariants}>
        <FormInput
          id="email"
          label="Email Address"
          type="email"
          placeholder="name@example.com"
          value={email}
          onChange={setEmail}
          error={errors.email}
          icon={<Mail className="h-4 w-4" />}
          disabled={isLoading || isCheckingEmail}
        />
        {emailNotRegistered && (
          <div className="mt-2 flex items-center text-sm text-amber-500">
            <AlertCircle className="mr-1 h-4 w-4" />
            <span>This email is not registered. <Link href="/sign-up" className="underline font-medium">Sign up instead?</Link></span>
          </div>
        )}
        {isCheckingEmail && !emailNotRegistered && (
          <div className="mt-2 flex items-center text-xs text-muted-foreground">
            <span className="animate-pulse">Checking email...</span>
          </div>
        )}
      </motion.div>

      <motion.div variants={itemVariants}>
        <Button 
          type="submit" 
          className="w-full" 
          disabled={isLoading || isCheckingEmail}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending Code...
            </>
          ) : (
            <>
              Send Reset Code
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </motion.div>

      <motion.div className="text-center text-sm" variants={itemVariants}>
        <Link href="/sign-in" className="text-primary font-medium hover:underline">
          Back to Sign In
        </Link>
      </motion.div>
    </motion.form>
  )
}