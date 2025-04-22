"use client"

import type { UserType } from "./compact-registration-form"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { UserIcon, UtensilsIcon, CarIcon } from "lucide-react"

interface UserTypeModalProps {
  onSelect: (type: UserType) => void
  onClose: () => void
}

export function UserTypeModal({ onSelect, onClose }: UserTypeModalProps) {
  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Select Account Type</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-3 gap-3 py-4">
          <Button variant="outline" className="flex flex-col h-auto py-3 px-2" onClick={() => onSelect("customer")}>
            <UserIcon className="h-5 w-5 mb-1" />
            <span className="text-xs">Customer</span>
          </Button>
          <Button variant="outline" className="flex flex-col h-auto py-3 px-2" onClick={() => onSelect("restaurant")}>
            <UtensilsIcon className="h-5 w-5 mb-1" />
            <span className="text-xs">Restaurant</span>
          </Button>
          <Button variant="outline" className="flex flex-col h-auto py-3 px-2" onClick={() => onSelect("driver")}>
            <CarIcon className="h-5 w-5 mb-1" />
            <span className="text-xs">Driver</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
