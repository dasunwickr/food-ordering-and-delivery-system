"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronLeft, User, Store, Car } from "lucide-react"

type UserType = "customer" | "restaurant" | "driver" | null

interface UserTypeFormProps {
  onSelect: (type: UserType) => void
  onBack: () => void
}

export function UserTypeForm({ onSelect, onBack }: UserTypeFormProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center">
          <Button variant="ghost" size="sm" onClick={onBack} className="mr-2 h-8 w-8 p-0">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-semibold tracking-tight">I am a...</h1>
        </div>
        <p className="text-sm text-muted-foreground">Select your account type to continue</p>
      </div>

      <div className="grid gap-4">
        <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => onSelect("customer")}>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <User className="mr-2 h-5 w-5" />
              Customer
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>I want to order food from restaurants</CardDescription>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => onSelect("restaurant")}>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Store className="mr-2 h-5 w-5" />
              Restaurant
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>I want to sell food through the platform</CardDescription>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => onSelect("driver")}>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Car className="mr-2 h-5 w-5" />
              Driver
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>I want to deliver food to customers</CardDescription>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
