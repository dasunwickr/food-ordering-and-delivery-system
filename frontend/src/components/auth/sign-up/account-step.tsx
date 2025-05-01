"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ArrowRight, Mail, AlertCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { FormInput } from "../form-input"
import { PasswordInput } from "../password-input"
import { SocialSignIn } from "./social-sign-in"
import { checkEmailExists } from "@/services/auth-service"

interface AccountStepProps {
  onSubmit: (email: string, password: string, confirmPassword: string) => void
}

export function AccountStep({ onSubmit }: AccountStepProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [errors, setErrors] = useState<{ email?: string; password?: string; confirmPassword?: string }>({})
  const [isCheckingEmail, setIsCheckingEmail] = useState(false)
  const [emailDebounceTimer, setEmailDebounceTimer] = useState<NodeJS.Timeout | null>(null)

  
  useEffect(() => {
    if (emailDebounceTimer) {
      clearTimeout(emailDebounceTimer)
    }

    if (!email || !/\S+@\S+\.\S+/.test(email) || email.length < 5) {
      return
    }

    const timer = setTimeout(async () => {
      try {
        setIsCheckingEmail(true)
        const result = await checkEmailExists(email)
        
        if (result.exists) {
          setErrors(prev => ({ ...prev, email: "This email is already registered" }))
        } else if (result.error) {
          setErrors(prev => ({ ...prev, email: result.error }))
        } else {
          setErrors(prev => {
            const { email, ...rest } = prev
            return rest
          })
        }
      } catch (error) {
        console.error("Email validation error:", error)
      } finally {
        setIsCheckingEmail(false)
      }
    }, 500)
    
    setEmailDebounceTimer(timer)
    
    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [email])

  const validateForm = () => {
    const newErrors: { email?: string; password?: string; confirmPassword?: string } = {}

    if (!email) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email"
    }

    if (!password) {
      newErrors.password = "Password is required"
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters long"
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (validateForm()) {
      try {
        setIsCheckingEmail(true)
        const result = await checkEmailExists(email)
        
        if (result.exists) {
          if (!errors.email) {
            setErrors(prev => ({ ...prev, email: "This email is already registered" }))
          }
          setIsCheckingEmail(false)
          return
        }
        
        onSubmit(email, password, confirmPassword)
      } catch (error) {
        console.error("Email validation error:", error)
      } finally {
        setIsCheckingEmail(false)
      }
    }
  }

  const containerVariants = {
    hidden: { opacity: 0, x: 100 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
        staggerChildren: 0.1,
      },
    },
    exit: {
      opacity: 0,
      x: -100,
      transition: {
        duration: 0.2,
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
      key="step1"
      onSubmit={handleSubmit}
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
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
          disabled={isCheckingEmail}
        />
        {errors.email && (
          <div className="mt-2 flex items-center text-sm text-destructive">
            <AlertCircle className="mr-1 h-4 w-4" />
            <span>{errors.email}</span>
          </div>
        )}
        {isCheckingEmail && !errors.email && (
          <div className="mt-2 flex items-center text-sm text-muted-foreground">
            <span className="animate-pulse">Checking email availability...</span>
          </div>
        )}
      </motion.div>

      <motion.div variants={itemVariants}>
        <PasswordInput id="password" label="Password" value={password} onChange={setPassword} error={errors.password} />
      </motion.div>

      <motion.div variants={itemVariants}>
        <PasswordInput
          id="confirmPassword"
          label="Confirm Password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          error={errors.confirmPassword}
        />
      </motion.div>

      <motion.div variants={itemVariants}>
        <Button type="submit" className="w-full">
          Continue
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </motion.div>

      <motion.div variants={itemVariants}>
        <SocialSignIn onGoogleSignIn={() => console.log("Google sign in")} />
      </motion.div>
    </motion.form>
  )
}
