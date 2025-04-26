"use client"

import { useState, useEffect } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AdminsTable } from "@/components/user-service/users/admins/admins-table"
import { CreateAdminModal } from "@/components/user-service/users/admins/create-admin-modal"
import { EditAdminModal } from "@/components/user-service/users/admins/edit-admin-modal"
import { DeleteAdminModal } from "@/components/user-service/users/admins/delete-admin-modal"
import { userService } from "@/services/user-service"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

export default function AdminsPage() {
  const [admins, setAdmins] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [selectedAdmin, setSelectedAdmin] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchAdmins()
  }, [])

  const fetchAdmins = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const fetchedAdmins = await userService.getAdmins()
      
      // Transform the API data to match the format expected by the component
      const transformedAdmins = fetchedAdmins.map(admin => ({
        id: admin.id,
        firstName: admin.firstName,
        lastName: admin.lastName,
        email: admin.email,
        contactNumber: admin.contactNumber || admin.phone || "Not provided",
        profilePicture: admin.profilePictureUrl || admin.profilePicture || "/placeholder.svg",
        adminType: admin.adminType === "TOP_LEVEL_ADMIN" ? "Top Level" :
                  admin.adminType === "SECOND_LEVEL_ADMIN" ? "2nd Level" :
                  admin.adminType === "THIRD_LEVEL_ADMIN" ? "3rd Level" : "Admin",
      }))
      
      setAdmins(transformedAdmins)
    } catch (err) {
      console.error('Failed to fetch admins:', err)
      setError('Failed to load admins. Please try again later.')
      toast.error('Failed to load admins')
    } finally {
      setLoading(false)
    }
  }

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

  const confirmDelete = async (password: string) => {
    try {
      // In a real app, you would verify password and then delete the admin
      // await userService.deleteAdmin(selectedAdmin.id, password);
      
      // For now, we'll just update the UI
      setAdmins(admins.filter((admin) => admin.id !== selectedAdmin.id))
      setDeleteModalOpen(false)
      toast.success('Admin deleted successfully')
    } catch (err) {
      console.error('Failed to delete admin:', err)
      toast.error('Failed to delete admin')
    }
  }

  const createAdmin = async (formData: any) => {
    try {
      // Map frontend admin type to backend format
      let adminTypeValue = "";
      switch (formData.adminType) {
        case "Top Level":
          adminTypeValue = "TOP_LEVEL_ADMIN";
          break;
        case "2nd Level":
          adminTypeValue = "SECOND_LEVEL_ADMIN";
          break;
        case "3rd Level": 
          adminTypeValue = "THIRD_LEVEL_ADMIN";
          break;
        default:
          adminTypeValue = "THIRD_LEVEL_ADMIN";
      }

      // Prepare auth data according to validation schema requirements
      const authData: {
        email: string;
        password: string;
        userType: string;
        profile: {
          firstName: string;
          lastName: string;
          contactNumber: string;
          profilePictureUrl?: string;
          adminType: string;
        }
      } = {
        email: formData.email,
        password: formData.password,
        userType: "ADMIN",
        profile: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          contactNumber: formData.contactNumber,
          profilePictureUrl: formData.profilePicture,
          adminType: adminTypeValue // Use the mapped enum value
        }
      };

      // Call the auth service signup endpoint
      const authResponse = await userService.register(authData as any, "admin");
      
      if (authResponse && authResponse.userId) {
        // If successful, add the new admin to the local state
        const newAdmin = {
          id: authResponse.userId,
          ...formData
        };
        
        setAdmins([...admins, newAdmin]);
        setCreateModalOpen(false);
        toast.success("Admin created successfully");
      } else {
        toast.error("Failed to create admin account");
      }
    } catch (error: any) {
      console.error("Error creating admin:", error);
      toast.error("Failed to create admin", {
        description: error.response?.data?.error || "An unknown error occurred"
      });
      throw error; // Re-throw to handle in the modal component
    }
  };

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

      {loading ? (
        <div className="flex h-[400px] w-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="flex h-[400px] w-full flex-col items-center justify-center">
          <p className="text-destructive">{error}</p>
          <button
            onClick={fetchAdmins}
            className="mt-4 rounded-md bg-primary px-4 py-2 text-primary-foreground"
          >
            Retry
          </button>
        </div>
      ) : (
        <AdminsTable admins={filteredAdmins} onEdit={handleEdit} onDelete={handleDelete} />
      )}

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
