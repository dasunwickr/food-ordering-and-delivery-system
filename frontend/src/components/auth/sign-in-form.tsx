"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight, Mail, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { FormInput } from "./form-input"
import { PasswordInput } from "./password-input"
import { SocialSignIn } from "./sign-up/social-sign-in"

interface SignInFormProps {
  onSubmit: (email: string, password: string) => void
  isLoading?: boolean
}

export function SignInForm({ onSubmit, isLoading = false }: SignInFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})

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
    if (validateForm()) {
      // Call the provided onSubmit function with email and password
      await onSubmit(email, password)
      // Redirection is now handled in the parent component
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
      <motion.div variants={itemVariants}>
        <FormInput
          id="email"
          label="Email"
          type="email"
          placeholder="name@example.com"
          value={email}
          onChange={setEmail}
          error={errors.email}
          icon={<Mail className="h-4 w-4" />}
          disabled={isLoading}
        />
      </motion.div>

      <motion.div variants={itemVariants}>
        <div className="flex justify-between">
          <label htmlFor="password" className="text-sm font-medium">
            Password
          </label>
          <Link href="/forgot-password" className="text-sm text-primary hover:underline">
            Forgot Password?
          </Link>
        </div>
        <div className="relative">
          <PasswordInput 
            id="password" 
            label="" 
            value={password} 
            onChange={setPassword} 
            error={errors.password} 
            disabled={isLoading}
          />
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Button type="submit" className="w-full" disabled={isLoading}>
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
