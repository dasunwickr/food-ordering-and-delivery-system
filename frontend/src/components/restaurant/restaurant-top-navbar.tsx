"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Bell, Menu, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { getLocalStorageItem } from "@/utils/storage"

interface RestaurantTopNavbarProps {
  onMenuClick: () => void
}

export function RestaurantTopNavbar({ onMenuClick }: RestaurantTopNavbarProps) {
  const [notificationCount, setNotificationCount] = useState(5)
  const [newOrdersCount, setNewOrdersCount] = useState(3)
  const [restaurantData, setRestaurantData] = useState({
    name: "Restaurant",
    email: "restaurant@example.com",
    profilePicture: "/placeholder.svg?height=32&width=32"
  })

  useEffect(() => {
    // Get user profile from localStorage if available
    const userProfile = getLocalStorageItem<any>('userProfile')
    if (userProfile) {
      // Use the correct property for profile picture (different APIs might use different property names)
      const profilePictureUrl = userProfile.profilePictureUrl || userProfile.profilePicture || restaurantData.profilePicture
      
      setRestaurantData({
        name: userProfile.restaurantName || userProfile.name || restaurantData.name,
        email: userProfile.email || restaurantData.email,
        profilePicture: profilePictureUrl
      })
    }
  }, [])

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      <Button variant="ghost" size="icon" className="md:hidden" onClick={onMenuClick}>
        <Menu className="h-5 w-5" />
        <span className="sr-only">Toggle menu</span>
      </Button>

      <div className="ml-auto flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/restaurant/orders">
            New Orders
            {newOrdersCount > 0 && (
              <Badge className="ml-2" variant="default">
                {newOrdersCount}
              </Badge>
            )}
          </Link>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {notificationCount > 0 && (
                <Badge className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs" variant="destructive">
                  {notificationCount}
                </Badge>
              )}
              <span className="sr-only">Notifications</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <div className="flex items-center justify-between p-4">
              <span className="text-sm font-medium">Notifications</span>
              <Button variant="ghost" size="sm" className="text-xs" onClick={() => setNotificationCount(0)}>
                Mark all as read
              </Button>
            </div>
            <DropdownMenuSeparator />
            <div className="max-h-80 overflow-y-auto">
              <div className="flex items-start gap-4 p-4 hover:bg-muted">
                <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <User className="h-4 w-4" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm">New order received</p>
                  <p className="text-xs text-muted-foreground">Order #12345 has been placed</p>
                  <p className="text-xs text-muted-foreground">5 minutes ago</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 hover:bg-muted">
                <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <User className="h-4 w-4" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm">Order ready for pickup</p>
                  <p className="text-xs text-muted-foreground">Driver is on the way for order #12340</p>
                  <p className="text-xs text-muted-foreground">15 minutes ago</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 hover:bg-muted">
                <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <User className="h-4 w-4" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm">New review received</p>
                  <p className="text-xs text-muted-foreground">A customer left a 5-star review</p>
                  <p className="text-xs text-muted-foreground">1 hour ago</p>
                </div>
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative h-8 w-8 rounded-full">
              <img
                src={restaurantData.profilePicture}
                alt={restaurantData.name}
                className="h-8 w-8 rounded-full object-cover"
                key={restaurantData.profilePicture} // Force re-render when image URL changes
              />
              <span className="sr-only">Profile</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <div className="flex items-center gap-2 p-2">
              <div className="flex flex-col space-y-1 leading-none">
                <p className="font-medium">{restaurantData.name}</p>
                <p className="text-xs text-muted-foreground">{restaurantData.email}</p>
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/restaurant/profile">Restaurant Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/restaurant/settings">Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/auth/logout">Logout</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
