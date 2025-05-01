"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProfileImageUploader } from "@/components/shared/profile-image-uploader"
import { ResetPasswordModal } from "@/components/user-service/profile/reset-password"
import { getLocalStorageItem, setLocalStorageItem } from "@/utils/storage"
import { MapSelector } from "@/components/ui/map-selector"
import { Modal } from "@/components/auth/modal"
import { MapPin, Loader2 } from "lucide-react"
import { userService, User } from "@/services/user-service"
import { useAtom } from "jotai"
import { setLocationAtom, LocationData } from "@/atoms/location-atoms"
import { toast } from "sonner"

// Extend User type to include location
type UserWithLocation = User & {
  location?: LocationData;
  locationCoordinates?: LocationData;
}

// Sample customer data
const CUSTOMER_DATA = {
  id: "1",
  firstName: "Emily",
  lastName: "Davis",
  email: "emily.d@example.com",
  contactNumber: "+1 234 567 896",
  profilePicture: "/placeholder.svg?height=120&width=120",
  location: {
    lat: 40.7128,
    lng: -74.006,
    address: "New York, NY, USA"
  }
}

export default function CustomerProfilePage() {
  const [customer, setCustomer] = useState(CUSTOMER_DATA)
  const [formData, setFormData] = useState({
    firstName: customer.firstName,
    lastName: customer.lastName,
    email: customer.email,
    contactNumber: customer.contactNumber,
  })
  const [resetPasswordModalOpen, setResetPasswordModalOpen] = useState(false)
  const [showLocationModal, setShowLocationModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [, setLocation] = useAtom(setLocationAtom)
  
  useEffect(() => {
    const userProfile = getLocalStorageItem<any>('userProfile')
    if (userProfile) {
      // Make sure we're using the correct property for profile picture
      const profilePictureUrl = userProfile.profilePictureUrl || userProfile.profilePicture || customer.profilePicture
      
      setCustomer({
        ...customer,
        id: userProfile.id || customer.id,
        firstName: userProfile.firstName || customer.firstName,
        lastName: userProfile.lastName || customer.lastName,
        email: userProfile.email || customer.email,
        contactNumber: userProfile.contactNumber || userProfile.phone || customer.contactNumber,
        profilePicture: profilePictureUrl,
        location: userProfile.location || userProfile.locationCoordinates || customer.location
      })
      
      setFormData({
        firstName: userProfile.firstName || customer.firstName,
        lastName: userProfile.lastName || customer.lastName,
        email: userProfile.email || customer.email,
        contactNumber: userProfile.contactNumber || userProfile.phone || customer.contactNumber,
      })
    }
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Create updated user data object
      const updatedUserData: Partial<UserWithLocation> = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.contactNumber,
        location: customer.location
      }

      // Call API to update user data
      const userId = customer.id
      if (!userId) {
        throw new Error("User ID not found")
      }
      
      await userService.updateUser(userId, updatedUserData as Partial<User>)

      // Update local state
      setCustomer(prevState => ({
        ...prevState,
        ...formData,
      }))

      // Update localStorage
      const userProfile = getLocalStorageItem<any>('userProfile')
      if (userProfile) {
        const updatedProfile = {
          ...userProfile,
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email, 
          contactNumber: formData.contactNumber,
          phone: formData.contactNumber,
          location: customer.location
        }
        setLocalStorageItem('userProfile', updatedProfile)
      }

      toast.success("Profile updated successfully")
    } catch (error) {
      console.error("Failed to update profile:", error)
      toast.error("Failed to update profile. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleProfileImageUpdate = async (imageUrl: string) => {
    try {
      const userId = customer.id
      if (!userId) {
        throw new Error("User ID not found")
      }
      
      console.log("Updating profile image with URL:", imageUrl)
      
      // Call API to update profile image
      const updatedUser = await userService.updateProfileImage(userId, imageUrl)
      console.log("Profile image update response:", updatedUser)

      // Update local state - use the profileImage property from the response if available
      setCustomer(prevState => ({
        ...prevState,
        profilePicture: imageUrl,
        profileImage: imageUrl // Add this property as well to ensure compatibility
      }))

      // Update localStorage with both property names to ensure compatibility
      const userProfile = getLocalStorageItem<any>('userProfile')
      if (userProfile) {
        const updatedProfile = {
          ...userProfile,
          profilePicture: imageUrl,
          profilePictureUrl: imageUrl,
          profileImage: imageUrl // Add this property as well to ensure compatibility
        }
        setLocalStorageItem('userProfile', updatedProfile)
      }

      toast.success("Profile picture updated successfully")
    } catch (error) {
      console.error("Failed to update profile picture:", error)
      toast.error("Failed to update profile picture. Please try again.")
    }
  }

  const handleLocationUpdate = async (selectedLocation: LocationData) => {
    try {
      const userId = customer.id
      if (!userId) {
        throw new Error("User ID not found")
      }

      // Update local state
      setCustomer(prevState => ({
        ...prevState,
        location: selectedLocation
      }))

      // Update in backend - use the cast to handle the type mismatch
      await userService.updateUser(userId, {
        location: selectedLocation
      } as Partial<User>)

      // Update localStorage
      const userProfile = getLocalStorageItem<any>('userProfile')
      if (userProfile) {
        const updatedProfile = {
          ...userProfile,
          location: selectedLocation,
          locationCoordinates: selectedLocation
        }
        setLocalStorageItem('userProfile', updatedProfile)
      }

      setShowLocationModal(false)
      toast.success("Location updated successfully")
    } catch (error) {
      console.error("Failed to update location:", error)
      toast.error("Failed to update location. Please try again.")
      setShowLocationModal(false)
    }
  }

  // Initialize map with current location when opening the modal
  const handleOpenLocationModal = () => {
    // Set the location atom to the current customer location
    if (customer.location && customer.location.lat && customer.location.lng) {
      // Make sure to set a complete location object with all required fields
      setLocation({
        lat: customer.location.lat,
        lng: customer.location.lng,
        address: customer.location.address || ''
      })
      console.log("Setting location in atom:", customer.location)
    }
    setShowLocationModal(true)
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight md:text-3xl">My Profile</h1>

      <Tabs defaultValue="details" className="space-y-4">
        <TabsList>
          <TabsTrigger value="details">Profile Details</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your personal information and contact details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center space-y-4 sm:flex-row sm:space-x-6 sm:space-y-0">
                <ProfileImageUploader currentImage={customer.profilePicture} onImageUpdate={handleProfileImageUpdate} />
                <div>
                  <h3 className="text-lg font-medium">
                    {customer.firstName} {customer.lastName}
                  </h3>
                  <p className="text-sm text-muted-foreground">Customer since January 2023</p>
                  <p className="text-xs text-muted-foreground mt-1">ID: {customer.id}</p>
                </div>
              </div>

              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" name="firstName" value={formData.firstName} onChange={handleInputChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" name="lastName" value={formData.lastName} onChange={handleInputChange} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactNumber">Contact Number</Label>
                  <Input
                    id="contactNumber"
                    name="contactNumber"
                    value={formData.contactNumber}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Delivery Location</Label>
                  <div className="flex items-center gap-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={handleOpenLocationModal}
                      className="flex items-center"
                    >
                      <MapPin className="h-4 w-4 mr-2" />
                      {customer.location?.address ? "Update Location" : "Set Your Location"}
                    </Button>
                  </div>
                  {customer.location?.address && (
                    <div className="p-3 mt-2 bg-gray-50 rounded-md">
                      <p className="text-sm">{customer.location.address}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Coordinates: {customer.location.lat.toFixed(6)}, {customer.location.lng.toFixed(6)}
                      </p>
                    </div>
                  )}
                </div>

                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Manage your password and security preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-medium">Password</h3>
                <p className="text-sm text-muted-foreground">Last updated: 2 months ago</p>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => setResetPasswordModalOpen(true)}>Reset Password</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="preferences">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Manage how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Notification preferences would go here */}
                <p className="text-sm text-muted-foreground">Notification preferences would be displayed here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <ResetPasswordModal
        open={resetPasswordModalOpen}
        onClose={() => setResetPasswordModalOpen(false)}
        onSubmit={async (data) => {
          try {
            // Call our reset password service function
            await userService.resetPassword(
              customer.id, 
              data.currentPassword, 
              data.newPassword
            );
            toast.success("Password reset successful");
            setResetPasswordModalOpen(false);
          } catch (error: any) {
            toast.error(error.message || "Password reset failed. Please try again.");
          }
        }}
      />

      <Modal
        isOpen={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        title="Update Your Delivery Location"
      >
        <MapSelector
          height="350px"
          onConfirmLocation={handleLocationUpdate}
        />
      </Modal>
    </div>
  )
}
