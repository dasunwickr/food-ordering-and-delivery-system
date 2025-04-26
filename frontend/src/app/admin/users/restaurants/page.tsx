"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RestaurantsTable } from "@/components/user-service/users/restaurants/restaurant-table"
import { RestaurantDetailsModal } from "@/components/user-service/users/restaurants/restaurant-details-modal"
import { EditRestaurantModal } from "@/components/user-service/users/restaurants/edit-restaurant-modal"
import { userService } from "@/services/user-service"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

export default function RestaurantsPage() {
  const [restaurants, setRestaurants] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [detailsModalOpen, setDetailsModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [selectedRestaurant, setSelectedRestaurant] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchRestaurants()
  }, [activeTab])

  const fetchRestaurants = async () => {
    try {
      setLoading(true)
      setError(null)

      let statusFilter: 'ACTIVE' | 'PENDING' | 'REJECTED' | undefined
      
      if (activeTab === 'active') statusFilter = 'ACTIVE'
      else if (activeTab === 'pending') statusFilter = 'PENDING'
      else if (activeTab === 'rejected') statusFilter = 'REJECTED'
      
      const fetchedRestaurants = await userService.getRestaurants()
      
      // Transform the API data to match the format expected by the component
      const transformedRestaurants = fetchedRestaurants.map(restaurant => ({
        id: restaurant.id,
        name: restaurant.restaurantName || restaurant.name,
        address: restaurant.restaurantAddress || restaurant.address,
        licenseNumber: restaurant.restaurantLicenseNumber || restaurant.licenseNumber,
        type: restaurant.restaurantType?.type || restaurant.type || "N/A",
        cuisines: restaurant.cuisineTypes?.map((ct: { name: string }) => ct.name) || restaurant.cuisines || [],
        status: restaurant.restaurantStatus || restaurant.status || "Pending",
        documents: restaurant.restaurantDocuments || restaurant.documents || [],
        openingTimes: restaurant.openingTime || restaurant.openingTimes || [],
        location: restaurant.location || { lat: 0, lng: 0 },
      }))
      
      setRestaurants(transformedRestaurants)
    } catch (err) {
      console.error('Failed to fetch restaurants:', err)
      setError('Failed to load restaurants. Please try again later.')
      toast.error('Failed to load restaurants')
    } finally {
      setLoading(false)
    }
  }

  const filteredRestaurants = restaurants.filter((restaurant) => {
    const matchesSearch =
      restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      restaurant.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      restaurant.licenseNumber.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesSearch
  })

  const handleViewDetails = (restaurant: any) => {
    setSelectedRestaurant(restaurant)
    setDetailsModalOpen(true)
  }

  const handleEdit = (restaurant: any) => {
    setSelectedRestaurant(restaurant)
    setEditModalOpen(true)
  }

  const handleApprove = async (id: string) => {
    try {
      await userService.approveUser(id, 'restaurant')
      setRestaurants(
        restaurants.map((restaurant) => (restaurant.id === id ? { ...restaurant, status: "Active" } : restaurant))
      )
      toast.success('Restaurant approved successfully')
    } catch (err) {
      console.error('Failed to approve restaurant:', err)
      toast.error('Failed to approve restaurant')
    }
  }

  const handleReject = async (id: string) => {
    try {
      await userService.rejectUser(id, 'restaurant')
      setRestaurants(
        restaurants.map((restaurant) => (restaurant.id === id ? { ...restaurant, status: "Rejected" } : restaurant))
      )
      toast.success('Restaurant rejected successfully')
    } catch (err) {
      console.error('Failed to reject restaurant:', err)
      toast.error('Failed to reject restaurant')
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Restaurants Management</h1>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <Input
          placeholder="Search restaurants..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {loading ? (
        <div className="flex h-[400px] w-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="flex h-[400px] w-full flex-col items-center justify-center">
          <p className="text-destructive">{error}</p>
          <button
            onClick={fetchRestaurants}
            className="mt-4 rounded-md bg-primary px-4 py-2 text-primary-foreground"
          >
            Retry
          </button>
        </div>
      ) : (
        <RestaurantsTable
          restaurants={filteredRestaurants}
          onViewDetails={handleViewDetails}
          onEdit={handleEdit}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      )}

      {selectedRestaurant && (
        <>
          <RestaurantDetailsModal
            open={detailsModalOpen}
            restaurant={selectedRestaurant}
            onClose={() => setDetailsModalOpen(false)}
          />

          <EditRestaurantModal
            open={editModalOpen}
            restaurant={selectedRestaurant}
            onClose={() => setEditModalOpen(false)}
            onSubmit={(data) => {
              setRestaurants(
                restaurants.map((restaurant) =>
                  restaurant.id === selectedRestaurant.id ? { ...restaurant, ...data } : restaurant
                )
              )
              setEditModalOpen(false)
            }}
          />
        </>
      )}
    </div>
  )
}
