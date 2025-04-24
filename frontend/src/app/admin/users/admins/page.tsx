"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AdminsTable } from "@/components/user-service/users/admins/admins-table"
import { CreateAdminModal } from "@/components/user-service/users/admins/create-admin-modal"
import { EditAdminModal } from "@/components/user-service/users/admins/edit-admin-modal"
import { DeleteAdminModal } from "@/components/user-service/users/admins/delete-admin-modal"

// Sample data
const SAMPLE_ADMINS = [
  {
    id: "1",
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    contactNumber: "+1 234 567 890",
    profilePicture: "/placeholder.svg?height=40&width=40",
    adminType: "Top Level",
  },
  {
    id: "2",
    firstName: "Jane",
    lastName: "Smith",
    email: "jane.smith@example.com",
    contactNumber: "+1 234 567 891",
    profilePicture: "/placeholder.svg?height=40&width=40",
    adminType: "2nd Level",
  },
  {
    id: "3",
    firstName: "Robert",
    lastName: "Johnson",
    email: "robert.johnson@example.com",
    contactNumber: "+1 234 567 892",
    profilePicture: "/placeholder.svg?height=40&width=40",
    adminType: "3rd Level",
  },
]

export default function AdminsPage() {
  const [admins, setAdmins] = useState(SAMPLE_ADMINS)
  const [searchQuery, setSearchQuery] = useState("")
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [selectedAdmin, setSelectedAdmin] = useState<any>(null)

  const filteredAdmins = admins.filter(
    (admin) =>
      admin.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      admin.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      admin.email.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleEdit = (admin: any) => {
    setSelectedAdmin(admin)
    setEditModalOpen(true)
  }

  const handleDelete = (admin: any) => {
    setSelectedAdmin(admin)
    setDeleteModalOpen(true)
  }

  const confirmDelete = (password: string) => {
    // In a real app, verify password before deleting
    setAdmins(admins.filter((admin) => admin.id !== selectedAdmin.id))
    setDeleteModalOpen(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Admins Management</h1>
        <Button onClick={() => setCreateModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Admin
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <Input
          placeholder="Search admins..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <AdminsTable admins={filteredAdmins} onEdit={handleEdit} onDelete={handleDelete} />

      <CreateAdminModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSubmit={(data) => {
          setAdmins([...admins, { id: String(admins.length + 1), ...data }])
          setCreateModalOpen(false)
        }}
      />

      {selectedAdmin && (
        <>
          <EditAdminModal
            open={editModalOpen}
            admin={selectedAdmin}
            onClose={() => setEditModalOpen(false)}
            onSubmit={(data) => {
              setAdmins(admins.map((admin) => (admin.id === selectedAdmin.id ? { ...admin, ...data } : admin)))
              setEditModalOpen(false)
            }}
          />

          <DeleteAdminModal
            open={deleteModalOpen}
            admin={selectedAdmin}
            onClose={() => setDeleteModalOpen(false)}
            onConfirm={confirmDelete}
          />
        </>
      )}
    </div>
  )
}
