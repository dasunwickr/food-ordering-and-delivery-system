"use client"

import { useEffect, useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Eye, Trash2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// Dummy data for initial load
const dummyCustomers = [
  {
    id: "1",
    firstName: "Alice",
    lastName: "Johnson",
    email: "alice@example.com",
    contactNumber: "+123456789",
    joinDate: "2024-12-01",
    ordersCount: 5,
    profilePicture: "",
  },
  {
    id: "2",
    firstName: "Bob",
    lastName: "Smith",
    email: "bob@example.com",
    contactNumber: "+987654321",
    joinDate: "2023-11-15",
    ordersCount: 12,
    profilePicture: "",
  },
]

export function CustomersTable() {
  const [customers, setCustomers] = useState<any[] | null>(null)

  useEffect(() => {
    // Simulate loading delay (e.g., from backend API)
    const timeout = setTimeout(() => {
      setCustomers(dummyCustomers)
    }, 1000)

    return () => clearTimeout(timeout)
  }, [])

  const handleViewDetails = (customer: any) => {
    alert(`Viewing details for ${customer.firstName} ${customer.lastName}`)
  }

  const handleDelete = (customer: any) => {
    if (window.confirm(`Are you sure you want to delete ${customer.firstName}?`)) {
      setCustomers((prev) => prev?.filter((c) => c.id !== customer.id) || [])
    }
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Join Date</TableHead>
            <TableHead>Orders</TableHead>
            <TableHead className="w-[80px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {!customers ? (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                Loading customers...
              </TableCell>
            </TableRow>
          ) : customers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                No customers found.
              </TableCell>
            </TableRow>
          ) : (
            customers.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage
                        src={customer.profilePicture || "/placeholder.svg"}
                        alt={`${customer.firstName} ${customer.lastName}`}
                      />
                      <AvatarFallback>
                        {customer.firstName[0]}
                        {customer.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <span>
                      {customer.firstName} {customer.lastName}
                    </span>
                  </div>
                </TableCell>
                <TableCell>{customer.email}</TableCell>
                <TableCell>{customer.contactNumber}</TableCell>
                <TableCell>{customer.joinDate}</TableCell>
                <TableCell>{customer.ordersCount}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleViewDetails(customer)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => handleDelete(customer)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
