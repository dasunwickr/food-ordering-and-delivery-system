"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Upload, Loader2 } from "lucide-react"
import { CldUploadButton } from 'next-cloudinary'
import { toast } from "sonner"

interface ProfileImageUploaderProps {
  currentImage: string
  onImageUpdate: (imageUrl: string) => void
  folder?: string
}

export function ProfileImageUploader({ 
  currentImage, 
  onImageUpdate, 
  folder = "food-ordering-system/profiles"
}: ProfileImageUploaderProps) {
  const [isHovering, setIsHovering] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [localImage, setLocalImage] = useState(currentImage)

  const handleUploadSuccess = (result: any) => {
    // Extract the secure URL from the Cloudinary response
    const imageUrl = result?.info?.secure_url
    
    // Print the profile image URL when uploaded
    console.log('Profile image uploaded:', imageUrl)
    
    if (imageUrl) {
      // Update local state immediately for immediate UI feedback
      setLocalImage(imageUrl)
      // Update the parent component's state with the new image URL
      onImageUpdate(imageUrl)
      toast.success("Profile image updated successfully")
    } else {
      console.error("Failed to get image URL from result:", result)
      toast.error("Failed to update profile image")
    }
    setIsUploading(false)
  }

  // Handle upload error
  const handleUploadError = () => {
    toast.error("An error occurred while uploading the image")
    setIsUploading(false)
  }

  // Update local image when prop changes (e.g. after saving to backend)
  if (currentImage !== localImage && !isUploading) {
    setLocalImage(currentImage)
  }

  return (
    <div 
      className="relative" 
      onMouseEnter={() => setIsHovering(true)} 
      onMouseLeave={() => setIsHovering(false)}
    >
      <Avatar className="h-24 w-24">
        <AvatarImage 
          src={localImage || "/placeholder.svg"} 
          alt="Profile" 
          className="object-cover"
          key={localImage} // Force re-render when image changes
        />
        <AvatarFallback>
          {localImage ? "Image" : "User"}
        </AvatarFallback>
      </Avatar>

      <div 
        className={`absolute inset-0 flex items-center justify-center rounded-full bg-black/50 transition-opacity duration-200 ${
          isHovering || isUploading ? "opacity-100" : "opacity-0"
        }`}
      >
        <CldUploadButton
          options={{
            maxFiles: 1,
            resourceType: "image",
            folder: folder,
            clientAllowedFormats: ["png", "jpeg", "jpg", "webp"],
            maxImageFileSize: 2000000, // 2MB
            sources: ["local", "camera", "url"],
            showUploadMoreButton: false,
            singleUploadAutoClose: true,
            cropping: true,
            croppingAspectRatio: 1,
            croppingShowDimensions: true
          }}
          onUpload={handleUploadSuccess}
          onError={handleUploadError}
          uploadPreset="food_ordering_app"
          className="h-full w-full flex items-center justify-center"
        >
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-10 w-10 rounded-full bg-black/50 text-white hover:bg-black/70"
            disabled={isUploading}
            onClick={() => setIsUploading(true)}
          >
            {isUploading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Upload className="h-5 w-5" />
            )}
            <span className="sr-only">Change profile picture</span>
          </Button>
        </CldUploadButton>
      </div>
    </div>
  )
}
