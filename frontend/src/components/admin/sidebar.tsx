"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  BarChart3, 
  ChevronDown, 
  Home, 
  Moon, 
  Sun, 
  Users, 
  X, 
  UtensilsCrossed, 
  Truck,
  Store,
  UserCog,
  ShieldCheck,
  Building,
  User,
  Car,
  ShoppingBag,
  ClipboardList,
  Menu
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"
import { useMobile } from "@/hooks/useMobile"
import Image from "next/image"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  open?: boolean
  onClose?: () => void
}

export function Sidebar({ className, open, onClose, ...props }: SidebarProps) {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const isMobile = useMobile()
  const [usersExpanded, setUsersExpanded] = useState(true)
  const [deliveryExpanded, setDeliveryExpanded] = useState(false)
  const [typesExpanded, setTypesExpanded] = useState(false)
  const [settingsExpanded, setSettingsExpanded] = useState(false)

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  const sidebarContent = (
    <div className={cn("flex h-full flex-col", className)} {...props}>
      <div className="flex h-16 items-center border-b px-4">
        <Link href="/admin" className="flex items-center gap-2 font-semibold">
          <Image src="/logo-dark.svg" alt="FoodAdmin logo" width={120} height={120} className="rounded-full" />
        </Link>
        {isMobile && (
          <Button variant="ghost" size="icon" className="ml-auto" onClick={onClose}>
            <X className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </Button>
        )}
      </div>
      <ScrollArea className="flex-1 px-2 py-4">
        <nav className="flex flex-col gap-1">
          <Link
            href="/admin"
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
              pathname === "/admin" ? "bg-accent text-accent-foreground" : "transparent",
            )}
          >
            <Home className="h-5 w-5" />
            Dashboard
          </Link>

          {/* User Management Section */}
          <div className="py-2">
            <button
              onClick={() => setUsersExpanded(!usersExpanded)}
              className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5" />
                User Management
              </div>
              <ChevronDown className={cn("h-4 w-4 transition-transform", usersExpanded ? "rotate-180" : "")} />
            </button>

            {usersExpanded && (
              <div className="ml-4 mt-1 flex flex-col gap-1 pl-4 border-l">
                <Link
                  href="/admin/users/admins"
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                    pathname === "/admin/users/admins" ? "bg-accent text-accent-foreground" : "transparent",
                  )}
                >
                  <ShieldCheck className="h-4 w-4" />
                  Admins
                </Link>
                <Link
                  href="/admin/users/restaurants"
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                    pathname === "/admin/users/restaurants" ? "bg-accent text-accent-foreground" : "transparent",
                  )}
                >
                  <Building className="h-4 w-4" />
                  Restaurants
                </Link>
                <Link
                  href="/admin/users/customers"
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                    pathname === "/admin/users/customers" ? "bg-accent text-accent-foreground" : "transparent",
                  )}
                >
                  <User className="h-4 w-4" />
                  Customers
                </Link>
            
                <Link
                  href="/admin/transactions"
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                    pathname === "/admin/transactions" ? "bg-accent text-accent-foreground" : "transparent",
                  )}
                >
                Transactions
                </Link>
                <Link
                  href="/admin/deliveryreports"
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                    pathname === "/admin/deliveryreports" ? "bg-accent text-accent-foreground" : "transparent",
                  )}
                >
                  Delivery Reports
                </Link>
                
                <Link
                  href="/admin/users/drivers"
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                    pathname === "/admin/users/drivers" ? "bg-accent text-accent-foreground" : "transparent",
                  )}
                >
                  <Car className="h-4 w-4" />
                  Drivers
                </Link>

            
                
                <Link
                  href="/admin/deliveryGraphs"
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                    pathname === "/admin/deliveryGraphs" ? "bg-accent text-accent-foreground" : "transparent",
                  )}
                >
                  Delivery Earnings Analytics
                 
                </Link>
                <Link
                  href="admin/orderGraphs"
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                    pathname === "/admin/orderGraphs" ? "bg-accent text-accent-foreground" : "transparent",
                  )}
                >
                   Order Transaction Analytics
                </Link>
              </div>
            )}
          </div>

          {/* Delivery Management Section */}
          <div className="py-2">
            <button
              onClick={() => setDeliveryExpanded(!deliveryExpanded)}
              className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <div className="flex items-center gap-3">
                <Truck className="h-5 w-5" />
                Delivery Management
              </div>
              <ChevronDown className={cn("h-4 w-4 transition-transform", deliveryExpanded ? "rotate-180" : "")} />
            </button>

            {deliveryExpanded && (
              <div className="ml-4 mt-1 flex flex-col gap-1 pl-4 border-l">
                <Link
                  href="/admin/delivery/active"
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                    pathname === "/admin/delivery/active" ? "bg-accent text-accent-foreground" : "transparent",
                  )}
                >
                  <ShoppingBag className="h-4 w-4" />
                  Active Deliveries
                </Link>
                <Link
                  href="/admin/delivery/history"
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                    pathname === "/admin/delivery/history" ? "bg-accent text-accent-foreground" : "transparent",
                  )}
                >
                  <ClipboardList className="h-4 w-4" />
                  Delivery History
                </Link>
              </div>
            )}
          </div>

          {/* Types Management Section */}
          <div className="py-2">
            <button
              onClick={() => setTypesExpanded(!typesExpanded)}
              className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <div className="flex items-center gap-3">
                <Store className="h-5 w-5" />
                Types Management
              </div>
              <ChevronDown className={cn("h-4 w-4 transition-transform", typesExpanded ? "rotate-180" : "")} />
            </button>

            {typesExpanded && (
              <div className="ml-4 mt-1 flex flex-col gap-1 pl-4 border-l">
                <Link
                  href="/admin/types/cuisine"
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                    pathname === "/admin/types/cuisine" ? "bg-accent text-accent-foreground" : "transparent",
                  )}
                >
                  <UtensilsCrossed className="h-4 w-4" />
                  Cuisine Types
                </Link>
                <Link
                  href="/admin/types/restaurant"
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                    pathname === "/admin/types/restaurant" ? "bg-accent text-accent-foreground" : "transparent",
                  )}
                >
                  <Menu className="h-4 w-4" />
                  Restaurant Types
                </Link>
              </div>
            )}
          </div>

          <Link
            href="/admin/analytics"
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
              pathname === "/admin/analytics" ? "bg-accent text-accent-foreground" : "transparent",
            )}
          >
            <BarChart3 className="h-5 w-5" />
            Analytics
          </Link>

          {/* Settings Section (for profile only) */}
          <Link
            href="/admin/settings"
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
              pathname === "/admin/settings" ? "bg-accent text-accent-foreground" : "transparent",
            )}
          >
            <UserCog className="h-5 w-5" />
            Settings
          </Link>
        </nav>
      </ScrollArea>
      <div className="border-t p-4">
        <Button variant="outline" size="sm" className="w-full justify-start gap-2" onClick={toggleTheme}>
          {theme === "dark" ? (
            <>
              <Sun className="h-4 w-4" />
              Light Mode
            </>
          ) : (
            <>
              <Moon className="h-4 w-4" />
              Dark Mode
            </>
          )}
        </Button>
      </div>
    </div>
  )

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onClose}>
        <SheetContent side="left" className="p-0">
          {sidebarContent}
        </SheetContent>
      </Sheet>
    )
  }

  return sidebarContent
}
