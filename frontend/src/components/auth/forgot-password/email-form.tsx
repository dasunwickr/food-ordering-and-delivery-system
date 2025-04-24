"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"

interface EmailFormProps {
  email: string
  updateEmail: (email: string) => void
  onSubmit: () => void
}

export function EmailForm({ email, updateEmail, onSubmit }: EmailFormProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Forgot Password</h1>
        <p className="text-sm text-muted-foreground">
          Enter your email address and we'll send you a code to reset your password
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => updateEmail(e.target.value)}
            required
          />
        </div>

        <Button type="submit" className="w-full">
          Send Reset Code
        </Button>

        <div className="text-center">
          <Link href="/sign-in" className="text-sm font-medium text-primary hover:underline">
            Back to Sign In
          </Link>
        </div>
      </div>
    </form>
  )
}
