"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface ResetPasswordFormProps {
  password: string
  confirmPassword: string
  updatePassword: (password: string) => void
  updateConfirmPassword: (confirmPassword: string) => void
  onSubmit: () => void
}

export function ResetPasswordForm({
  password,
  confirmPassword,
  updatePassword,
  updateConfirmPassword,
  onSubmit,
}: ResetPasswordFormProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit()
  }

  const passwordsMatch = password === confirmPassword

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Reset Password</h1>
        <p className="text-sm text-muted-foreground">Create a new password for your account</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="password">New Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => updatePassword(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => updateConfirmPassword(e.target.value)}
            required
          />
          {confirmPassword && !passwordsMatch && <p className="text-sm text-destructive">Passwords do not match</p>}
        </div>

        <Button type="submit" className="w-full" disabled={!password || !confirmPassword || !passwordsMatch}>
          Reset Password
        </Button>
      </div>
    </form>
  )
}
