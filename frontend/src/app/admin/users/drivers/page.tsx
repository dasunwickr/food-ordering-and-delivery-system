"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DriversTable } from "@/components/user-service/users/drivers/drivers-table"
import { DriverDetailsModal } from "@/components/user-service/users/drivers/driver-detials-modal"
import { EditDriverModal } from "@/components/user-service/users/drivers/edit-driver-modal"
import { userService } from "@/services/user-service"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

export default function DriversPage() {
  const [drivers, setDrivers] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [detailsModalOpen, setDetailsModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [selectedDriver, setSelectedDriver] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDrivers()
  }, [activeTab])

  const fetchDrivers = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const fetchedDrivers = await userService.getDrivers()
      
      const transformedDrivers = fetchedDrivers.map(driver => ({
        id: driver.id,
        firstName: driver.firstName,
        lastName: driver.lastName,
        email: driver.email,
        contactNumber: driver.contactNumber || driver.phone,
        profilePicture: driver.profilePictureUrl || driver.profilePicture || "/placeholder.svg",
        vehicleType: driver.vehicleType?.type || driver.vehicleType || "Not specified",
        vehicleNumber: driver.vehicleNumber || "N/A",
        documents: driver.vehicleDocuments || driver.documents || [],
        status: driver.driverStatus || driver.status || "Pending",
        location: driver.location || { lat: 0, lng: 0 },
      }))
      
      setDrivers(transformedDrivers)
    } catch (err) {
      console.error('Failed to fetch drivers:', err)
      setError('Failed to load drivers. Please try again later.')
      toast.error('Failed to load drivers')
    } finally {
      setLoading(false)
    }
  }

  const filteredDrivers = drivers.filter((driver) => {
    const matchesSearch =
      driver.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      driver.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      driver.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      driver.vehicleNumber.toLowerCase().includes(searchQuery.toLowerCase())

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

  const handleApprove = async (id: string) => {
    try {
      await userService.approveUser(id, 'driver')
      setDrivers(drivers.map((driver) => (driver.id === id ? { ...driver, status: "Active" } : driver)))
      toast.success('Driver approved successfully')
    } catch (err) {
      console.error('Failed to approve driver:', err)
      toast.error('Failed to approve driver')
    }
  }

  const handleReject = async (id: string) => {
    try {
      await userService.rejectUser(id, 'driver')
      setDrivers(drivers.map((driver) => (driver.id === id ? { ...driver, status: "Rejected" } : driver)))
      toast.success('Driver rejected successfully')
    } catch (err) {
      console.error('Failed to reject driver:', err)
      toast.error('Failed to reject driver')
    }
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

      {loading ? (
        <div className="flex h-[400px] w-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="flex h-[400px] w-full flex-col items-center justify-center">
          <p className="text-destructive">{error}</p>
          <button
            onClick={fetchDrivers}
            className="mt-4 rounded-md bg-primary px-4 py-2 text-primary-foreground"
          >
            Retry
          </button>
        </div>
      ) : (
        <DriversTable
          drivers={filteredDrivers}
          onViewDetails={handleViewDetails}
          onEdit={handleEdit}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      )}

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
