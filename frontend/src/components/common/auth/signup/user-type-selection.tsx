"use client"

import type { UserType } from "./registration-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { UserIcon, UtensilsIcon, CarIcon } from "lucide-react"

interface UserTypeSelectionProps {
  selectedType: UserType | null
  onSelect: (type: UserType) => void
}

export function UserTypeSelection({ selectedType, onSelect }: UserTypeSelectionProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Choose Account Type</h1>
        <p className="text-muted-foreground mt-2">Select the type of account you want to create</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card
          className={`cursor-pointer transition-all hover:border-primary ${
            selectedType === "customer" ? "border-2 border-primary" : ""
          }`}
          onClick={() => onSelect("customer")}
        >
          <CardHeader className="text-center pb-2">
            <div className="mx-auto bg-primary/10 p-3 rounded-full w-16 h-16 flex items-center justify-center">
              <UserIcon className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="mt-4">Customer</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-center">Order food from your favorite restaurants</CardDescription>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer transition-all hover:border-primary ${
            selectedType === "restaurant" ? "border-2 border-primary" : ""
          }`}
          onClick={() => onSelect("restaurant")}
        >
          <CardHeader className="text-center pb-2">
            <div className="mx-auto bg-primary/10 p-3 rounded-full w-16 h-16 flex items-center justify-center">
              <UtensilsIcon className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="mt-4">Restaurant</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-center">Manage your restaurant and receive orders</CardDescription>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer transition-all hover:border-primary ${
            selectedType === "driver" ? "border-2 border-primary" : ""
          }`}
          onClick={() => onSelect("driver")}
        >
          <CardHeader className="text-center pb-2">
            <div className="mx-auto bg-primary/10 p-3 rounded-full w-16 h-16 flex items-center justify-center">
              <CarIcon className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="mt-4">Driver</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-center">Deliver food and earn money</CardDescription>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
