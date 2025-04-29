"use client"

import { useState, useEffect } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AdminsTable } from "@/components/user-service/users/admins/admins-table"
import { CreateAdminModal } from "@/components/user-service/users/admins/create-admin-modal"
import { EditAdminModal } from "@/components/user-service/users/admins/edit-admin-modal"
import { DeleteUserModal } from "@/components/user-service/users/common/delete-user-modal"
import { userService } from "@/services/user-service"
import { toast } from "sonner"
import api from "@/lib/axios"

interface Admin {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  contactNumber?: string;
  profilePicture?: string;
  adminType?: string;
}

const DUMMY_ADMINS: Admin[] = [
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
  const [admins, setAdmins] = useState<Admin[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchAdmins() {
      try {
        setIsLoading(true)
        const adminData = await userService.getAdmins()
        const formattedAdmins: Admin[] = adminData.map(admin => ({
          id: admin.id,
          firstName: admin.firstName,
          lastName: admin.lastName,
          email: admin.email,
          contactNumber: admin.phone,
          profilePicture: admin.profileImage || "/placeholder.svg?height=40&width=40",
          adminType: (admin as any).adminType || "Admin"
        }))
        setAdmins(formattedAdmins)
      } catch (err) {
        console.error("API failed, loading dummy data...")
        setAdmins(DUMMY_ADMINS)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAdmins()
  }, [])

  const filteredAdmins = admins.filter(
    (admin) =>
      admin.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      admin.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      admin.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleEdit = (admin: Admin) => {
    setSelectedAdmin(admin)
    setEditModalOpen(true)
  }

  const handleDelete = (admin: Admin) => {
    setSelectedAdmin(admin)
    setDeleteModalOpen(true)
  }

  const confirmDelete = async () => {
    if (!selectedAdmin) return

    try {
      await userService.deleteUser(selectedAdmin.id, "ADMIN")
      setAdmins(admins.filter((admin) => admin.id !== selectedAdmin.id))
      toast.success("Admin deleted successfully")
    } catch (error: any) {
      console.error("Error deleting admin:", error)
      toast.error(error.response?.data?.message || "Failed to delete admin")
    } finally {
      setDeleteModalOpen(false)
    }
  }

  const createAdmin = async (formData: any) => {
    try {
      let adminTypeValue = ""
      switch (formData.adminType) {
        case "Top Level":
          adminTypeValue = "TOP_LEVEL_ADMIN"
          break
        case "2nd Level":
          adminTypeValue = "SECOND_LEVEL_ADMIN"
          break
        case "3rd Level":
        default:
          adminTypeValue = "THIRD_LEVEL_ADMIN"
      }

      const authData = {
        email: formData.email,
        password: formData.password,
        userType: "ADMIN",
        profile: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          contactNumber: formData.contactNumber,
          profilePictureUrl: formData.profilePicture,
          adminType: adminTypeValue
        }
      }

      const authResponse = await api.post('/auth-service/auth/signup', authData)

      if (authResponse.data && typeof authResponse.data === 'object' && 'userId' in authResponse.data) {
        const newAdmin: Admin = {
          id: authResponse.data.userId,
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          contactNumber: formData.contactNumber || "",
          profilePicture: formData.profilePicture || "/placeholder.svg?height=40&width=40",
          adminType: formData.adminType || "3rd Level"
        }

        setAdmins(prev => [...prev, newAdmin])
        toast.success("Admin created successfully")
        setCreateModalOpen(false)
      } else {
        toast.error("Failed to create admin account")
      }
    } catch (error: any) {
      console.error("Error creating admin:", error)
      toast.error("Failed to create admin", {
        description: error.response?.data?.error || "An unknown error occurred"
      })
      throw error
    }
  }

  const updateAdmin = async (data: any) => {
    if (!selectedAdmin) return

    try {
      setAdmins(admins.map((admin) =>
        admin.id === selectedAdmin.id ? { ...admin, ...data } : admin
      ))
      toast.success("Admin updated successfully")
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update admin")
    } finally {
      setEditModalOpen(false)
    }
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

      <AdminsTable 
        admins={filteredAdmins} 
        onEdit={handleEdit} 
        onDelete={handleDelete} 
        isLoading={isLoading} 
      />

      <CreateAdminModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSubmit={createAdmin}
      />

      {selectedAdmin && (
        <>
          <EditAdminModal
            open={editModalOpen}
            admin={selectedAdmin}
            onClose={() => setEditModalOpen(false)}
            onSubmit={updateAdmin}
          />

          <DeleteUserModal
            open={deleteModalOpen}
            userType="admin"
            userName={`${selectedAdmin.firstName} ${selectedAdmin.lastName}`}
            onClose={() => setDeleteModalOpen(false)}
            onConfirm={confirmDelete}
          />
        </>
      )}
    </div>
  )
}
