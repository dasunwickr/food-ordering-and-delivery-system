"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DriversTable } from "@/components/user-service/users/drivers/drivers-table"
import { DriverDetailsModal } from "@/components/user-service/users/drivers/driver-detials-modal"
import { EditDriverModal } from "@/components/user-service/users/drivers/edit-driver-modal"

// Sample data
const SAMPLE_DRIVERS = [
  {
    id: "1",
    firstName: "Michael",
    lastName: "Johnson",
    email: "michael.j@example.com",
    contactNumber: "+1 234 567 893",
    profilePicture: "/placeholder.svg?height=40&width=40",
    vehicleType: "Car",
    vehicleNumber: "ABC-1234",
    documents: [
      { name: "Driver's License", url: "#" },
      { name: "Vehicle Registration", url: "#" },
      { name: "Insurance", url: "#" },
    ],
    status: "Active",
  },
  {
    id: "2",
    firstName: "Sarah",
    lastName: "Williams",
    email: "sarah.w@example.com",
    contactNumber: "+1 234 567 894",
    profilePicture: "/placeholder.svg?height=40&width=40",
    vehicleType: "Motorcycle",
    vehicleNumber: "XYZ-5678",
    documents: [
      { name: "Driver's License", url: "#" },
      { name: "Vehicle Registration", url: "#" },
      { name: "Insurance", url: "#" },
    ],
    status: "Active",
  },
  {
    id: "3",
    firstName: "David",
    lastName: "Brown",
    email: "david.b@example.com",
    contactNumber: "+1 234 567 895",
    profilePicture: "/placeholder.svg?height=40&width=40",
    vehicleType: "Bicycle",
    vehicleNumber: "N/A",
    documents: [
      { name: "ID Card", url: "#" },
      { name: "Proof of Address", url: "#" },
    ],
    status: "Pending",
  },
]

export default function DriversPage() {
  const [drivers, setDrivers] = useState(SAMPLE_DRIVERS)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [detailsModalOpen, setDetailsModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [selectedDriver, setSelectedDriver] = useState<any>(null)

  const filteredDrivers = drivers.filter((driver) => {
    const matchesSearch =
      driver.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      driver.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      driver.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      driver.vehicleNumber.toLowerCase().includes(searchQuery.toLowerCase())

    if (activeTab === "all") return matchesSearch
    if (activeTab === "active") return matchesSearch && driver.status === "Active"
    if (activeTab === "pending") return matchesSearch && driver.status === "Pending"

    return matchesSearch
  })

  const handleViewDetails = (driver: any) => {
    setSelectedDriver(driver)
    setDetailsModalOpen(true)
  }

  const handleEdit = (driver: any) => {
    setSelectedDriver(driver)
    setEditModalOpen(true)
  }

  const handleApprove = (id: string) => {
    setDrivers(drivers.map((driver) => (driver.id === id ? { ...driver, status: "Active" } : driver)))
  }

  const handleReject = (id: string) => {
    setDrivers(drivers.map((driver) => (driver.id === id ? { ...driver, status: "Rejected" } : driver)))
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Drivers Management</h1>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <Input
          placeholder="Search drivers..."
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

      <DriversTable
        drivers={filteredDrivers}
        onViewDetails={handleViewDetails}
        onEdit={handleEdit}
        onApprove={handleApprove}
        onReject={handleReject}
      />

      {selectedDriver && (
        <>
          <DriverDetailsModal
            open={detailsModalOpen}
            driver={selectedDriver}
            onClose={() => setDetailsModalOpen(false)}
          />

          <EditDriverModal
            open={editModalOpen}
            driver={selectedDriver}
            onClose={() => setEditModalOpen(false)}
            onSubmit={(data) => {
              setDrivers(drivers.map((driver) => (driver.id === selectedDriver.id ? { ...driver, ...data } : driver)))
              setEditModalOpen(false)
            }}
          />
        </>
      )}
    </div>
  )
}
