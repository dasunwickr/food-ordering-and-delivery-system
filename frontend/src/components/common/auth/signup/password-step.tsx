"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Lock, Check, X } from "lucide-react"

interface PasswordStepProps {
  password: string
  updatePassword: (password: string) => void
  error?: string
}

interface ValidationRule {
  id: string
  label: string
  validate: (password: string) => boolean
}

export function PasswordStep({ password, updatePassword, error }: PasswordStepProps) {
  const [showPassword, setShowPassword] = useState(false)

  const validationRules: ValidationRule[] = [
    {
      id: "length",
      label: "At least 8 characters",
      validate: (password) => password.length >= 8,
    },
    {
      id: "uppercase",
      label: "At least 1 uppercase letter",
      validate: (password) => /[A-Z]/.test(password),
    },
    {
      id: "lowercase",
      label: "At least 1 lowercase letter",
      validate: (password) => /[a-z]/.test(password),
    },
    {
      id: "number",
      label: "At least 1 number",
      validate: (password) => /[0-9]/.test(password),
    },
    {
      id: "special",
      label: "At least 1 special character",
      validate: (password) => /[^A-Za-z0-9]/.test(password),
    },
  ]

  const [validations, setValidations] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const newValidations: Record<string, boolean> = {}
    validationRules.forEach((rule) => {
      newValidations[rule.id] = rule.validate(password)
    })
    setValidations(newValidations)
  }, [password])

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-medium">Create Password</h2>

      <div className="space-y-1">
        <Label htmlFor="password" className="text-xs font-medium">
          Password
        </Label>
        <div className="relative">
          <Lock className="absolute left-2 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => updatePassword(e.target.value)}
            className={`pl-8 h-9 text-sm ${error ? "border-destructive" : ""}`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2 top-2 text-xs text-muted-foreground hover:text-foreground"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
        {error && <p className="text-destructive text-xs">{error}</p>}
      </div>

      <div className="space-y-2 bg-muted/30 p-3 rounded-md">
        <h3 className="text-xs font-medium">Password must contain:</h3>
        <ul className="space-y-1">
          {validationRules.map((rule) => (
            <li key={rule.id} className="flex items-center text-xs">
              {validations[rule.id] ? (
                <Check className="h-3 w-3 mr-1.5 text-green-500" />
              ) : (
                <X className="h-3 w-3 mr-1.5 text-muted-foreground" />
              )}
              <span className={validations[rule.id] ? "text-green-700" : "text-muted-foreground"}>{rule.label}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="space-y-1">
        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
          <div
            className={`h-full transition-all ${
              Object.values(validations).filter(Boolean).length <= 1
                ? "bg-red-500"
                : Object.values(validations).filter(Boolean).length <= 3
                  ? "bg-yellow-500"
                  : "bg-green-500"
            }`}
            style={{
              width: `${(Object.values(validations).filter(Boolean).length / validationRules.length) * 100}%`,
            }}
          ></div>
        </div>
        <p className="text-[10px] text-muted-foreground">
          Password strength:{" "}
          {Object.values(validations).filter(Boolean).length <= 1
            ? "Weak"
            : Object.values(validations).filter(Boolean).length <= 3
              ? "Medium"
              : "Strong"}
        </p>
      </div>
    </div>
  )
}
