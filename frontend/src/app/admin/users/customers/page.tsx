"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { CustomersTable } from "@/components/user-service/users/customers/customers-table"
import { CustomerDetailsModal } from "@/components/user-service/users/customers/customer-detials-modal"
import { userService } from "@/services/user-service"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [detailsModalOpen, setDetailsModalOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchCustomers()
  }, [])

  const fetchCustomers = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const fetchedCustomers = await userService.getCustomers()
      
      // Transform the API data to match the format expected by the component
      const transformedCustomers = fetchedCustomers.map(customer => ({
        id: customer.id,
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: customer.email,
        contactNumber: customer.contactNumber || customer.phone || "Not provided",
        profilePicture: customer.profilePictureUrl || customer.profilePicture || "/placeholder.svg",
        joinDate: customer.createdAt ? new Date(customer.createdAt).toLocaleDateString() : "Unknown",
        ordersCount: customer.ordersCount || 0,
        location: customer.location || null,
      }))
      
      setCustomers(transformedCustomers)
    } catch (err) {
      console.error('Failed to fetch customers:', err)
      setError('Failed to load customers. Please try again later.')
      toast.error('Failed to load customers')
    } finally {
      setLoading(false)
    }
  }

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (customer.contactNumber && customer.contactNumber.includes(searchQuery)),
  )

  const handleViewDetails = (customer: any) => {
    setSelectedCustomer(customer)
    setDetailsModalOpen(true)
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Customers Management</h1>

      <div className="flex items-center gap-4">
        <Input
          placeholder="Search customers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {loading ? (
        <div className="flex h-[400px] w-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="flex h-[400px] w-full flex-col items-center justify-center">
          <p className="text-destructive">{error}</p>
          <button
            onClick={fetchCustomers}
            className="mt-4 rounded-md bg-primary px-4 py-2 text-primary-foreground"
          >
            Retry
          </button>
        </div>
      ) : (
        <CustomersTable customers={filteredCustomers} onViewDetails={handleViewDetails} />
      )}

      {selectedCustomer && (
        <CustomerDetailsModal
          open={detailsModalOpen}
          customer={selectedCustomer}
          onClose={() => setDetailsModalOpen(false)}
        />
      )}
    </div>
  )
}
