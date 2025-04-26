"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { CustomersTable } from "@/components/user-service/users/customers/customers-table"
import { CustomerDetailsModal } from "@/components/user-service/users/customers/customer-detials-modal"
// Sample data
const SAMPLE_CUSTOMERS = [
  {
    id: "1",
    firstName: "Emily",
    lastName: "Davis",
    email: "emily.d@example.com",
    contactNumber: "+1 234 567 896",
    profilePicture: "/placeholder.svg?height=40&width=40",
    location: { lat: 40.7128, lng: -74.006 },
    joinDate: "2023-01-15",
    ordersCount: 24,
  },
  {
    id: "2",
    firstName: "James",
    lastName: "Wilson",
    email: "james.w@example.com",
    contactNumber: "+1 234 567 897",
    profilePicture: "/placeholder.svg?height=40&width=40",
    location: { lat: 40.7328, lng: -73.996 },
    joinDate: "2023-02-20",
    ordersCount: 18,
  },
  {
    id: "3",
    firstName: "Olivia",
    lastName: "Martinez",
    email: "olivia.m@example.com",
    contactNumber: "+1 234 567 898",
    profilePicture: "/placeholder.svg?height=40&width=40",
    location: { lat: 40.7428, lng: -74.016 },
    joinDate: "2023-03-10",
    ordersCount: 32,
  },
]

export default function CustomersPage() {
  const [customers, setCustomers] = useState(SAMPLE_CUSTOMERS)
  const [searchQuery, setSearchQuery] = useState("")
  const [detailsModalOpen, setDetailsModalOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null)

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.contactNumber.includes(searchQuery),
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

      <CustomersTable customers={filteredCustomers} onViewDetails={handleViewDetails} />

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
