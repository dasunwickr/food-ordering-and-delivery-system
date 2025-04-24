"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Upload } from "lucide-react"

interface ProfileImageUploaderProps {
  currentImage: string
  onImageUpdate: (imageUrl: string) => void
}

export function ProfileImageUploader({ currentImage, onImageUpdate }: ProfileImageUploaderProps) {
  const [isHovering, setIsHovering] = useState(false)

  // In a real app, this would handle file uploads to a storage service
  const handleImageUpload = () => {
    // Simulate a file upload by using a different placeholder
    const randomId = Math.floor(Math.random() * 1000)
    const newImageUrl = `/placeholder.svg?height=120&width=120&text=User+${randomId}`
    onImageUpdate(newImageUrl)
  }

  return (
    <div className="relative" onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}>
      <Avatar className="h-24 w-24">
        <AvatarImage src={currentImage || "/placeholder.svg"} alt="Profile" />
        <AvatarFallback>User</AvatarFallback>
      </Avatar>

      {isHovering && (
        <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-white" onClick={handleImageUpload}>
            <Upload className="h-4 w-4" />
            <span className="sr-only">Upload new image</span>
          </Button>
        </div>
      )}
    </div>
  )
}
