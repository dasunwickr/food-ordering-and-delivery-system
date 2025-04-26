"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RestaurantsTable } from "@/components/user-service/users/restaurants/restaurant-table"
import { RestaurantDetailsModal } from "@/components/user-service/users/restaurants/restaurant-details-modal"
import { EditRestaurantModal } from "@/components/user-service/users/restaurants/edit-restaurant-modal"

// Sample data
const SAMPLE_RESTAURANTS = [
  {
    id: "1",
    name: "Burger Palace",
    address: "123 Main St, New York, NY",
    licenseNumber: "LIC-12345",
    type: "Fast Food",
    cuisines: ["American", "Burgers"],
    status: "Active",
    documents: [
      { name: "Business License", url: "#" },
      { name: "Food Safety Certificate", url: "#" },
    ],
    openingTimes: [
      { day: "Monday", open: "09:00", close: "22:00" },
      { day: "Tuesday", open: "09:00", close: "22:00" },
      { day: "Wednesday", open: "09:00", close: "22:00" },
      { day: "Thursday", open: "09:00", close: "22:00" },
      { day: "Friday", open: "09:00", close: "23:00" },
      { day: "Saturday", open: "10:00", close: "23:00" },
      { day: "Sunday", open: "10:00", close: "22:00" },
    ],
    location: { lat: 40.7128, lng: -74.006 },
  },
  {
    id: "2",
    name: "Sushi Express",
    address: "456 Broadway, New York, NY",
    licenseNumber: "LIC-67890",
    type: "Restaurant",
    cuisines: ["Japanese", "Sushi"],
    status: "Active",
    documents: [
      { name: "Business License", url: "#" },
      { name: "Food Safety Certificate", url: "#" },
    ],
    openingTimes: [
      { day: "Monday", open: "11:00", close: "22:00" },
      { day: "Tuesday", open: "11:00", close: "22:00" },
      { day: "Wednesday", open: "11:00", close: "22:00" },
      { day: "Thursday", open: "11:00", close: "22:00" },
      { day: "Friday", open: "11:00", close: "23:00" },
      { day: "Saturday", open: "12:00", close: "23:00" },
      { day: "Sunday", open: "12:00", close: "22:00" },
    ],
    location: { lat: 40.7228, lng: -73.998 },
  },
  {
    id: "3",
    name: "Pizza Corner",
    address: "789 5th Ave, New York, NY",
    licenseNumber: "LIC-24680",
    type: "Restaurant",
    cuisines: ["Italian", "Pizza"],
    status: "Pending",
    documents: [
      { name: "Business License", url: "#" },
      { name: "Food Safety Certificate", url: "#" },
    ],
    openingTimes: [
      { day: "Monday", open: "10:00", close: "23:00" },
      { day: "Tuesday", open: "10:00", close: "23:00" },
      { day: "Wednesday", open: "10:00", close: "23:00" },
      { day: "Thursday", open: "10:00", close: "23:00" },
      { day: "Friday", open: "10:00", close: "00:00" },
      { day: "Saturday", open: "11:00", close: "00:00" },
      { day: "Sunday", open: "11:00", close: "23:00" },
    ],
    location: { lat: 40.7648, lng: -73.977 },
  },
]

export default function RestaurantsPage() {
  const [restaurants, setRestaurants] = useState(SAMPLE_RESTAURANTS)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [detailsModalOpen, setDetailsModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [selectedRestaurant, setSelectedRestaurant] = useState<any>(null)

  const filteredRestaurants = restaurants.filter((restaurant) => {
    const matchesSearch =
      restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      restaurant.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      restaurant.licenseNumber.toLowerCase().includes(searchQuery.toLowerCase())

    if (activeTab === "all") return matchesSearch
    if (activeTab === "active") return matchesSearch && restaurant.status === "Active"
    if (activeTab === "pending") return matchesSearch && restaurant.status === "Pending"

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

  const handleApprove = (id: string) => {
    setRestaurants(
      restaurants.map((restaurant) => (restaurant.id === id ? { ...restaurant, status: "Active" } : restaurant)),
    )
  }

  const handleReject = (id: string) => {
    setRestaurants(
      restaurants.map((restaurant) => (restaurant.id === id ? { ...restaurant, status: "Rejected" } : restaurant)),
    )
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

      <RestaurantsTable
        restaurants={filteredRestaurants}
        onViewDetails={handleViewDetails}
        onEdit={handleEdit}
        onApprove={handleApprove}
        onReject={handleReject}
      />

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
                  restaurant.id === selectedRestaurant.id ? { ...restaurant, ...data } : restaurant,
                ),
              )
              setEditModalOpen(false)
            }}
          />
        </>
      )}
    </div>
  )
}
