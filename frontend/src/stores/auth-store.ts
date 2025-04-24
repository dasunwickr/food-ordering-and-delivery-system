import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

interface UserData {
  email: string
  firstName: string
  lastName: string
  phone: string
  profileImage: string | null
  userType: 'customer' | 'restaurant' | null
  location?: {
    lat: number
    lng: number
    address: string
  }
}

interface AuthState {
  userData: UserData
  isLoggedIn: boolean
  
  // Actions
  setUserData: (data: Partial<UserData>) => void
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  register: (userData: Partial<UserData>) => Promise<boolean>
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        userData: {
          email: "",
          firstName: "",
          lastName: "",
          phone: "",
          profileImage: null,
          userType: null,
        },
        isLoggedIn: false,
        
        setUserData: (data) => set((state) => ({
          userData: { ...state.userData, ...data }
        })),
        
        login: async (email, password) => {
          try {
            // Here you would call your actual login API
            console.log("Logging in with:", { email, password })
            
            // Mock successful login
            set({
              isLoggedIn: true,
              userData: {
                email,
                firstName: "Demo",
                lastName: "User",
                phone: "",
                profileImage: null,
                userType: 'customer'
              }
            })
            return true
          } catch (error) {
            console.error("Login failed:", error)
            return false
          }
        },
        
        logout: () => set({
          isLoggedIn: false,
          userData: {
            email: "",
            firstName: "",
            lastName: "",
            phone: "",
            profileImage: null,
            userType: null,
          }
        }),
        
        register: async (userData) => {
          try {
            // Here you would call your actual registration API
            console.log("Registering with:", userData)
            
            // Mock successful registration
            set({
              isLoggedIn: true,
              userData: {
                ...userData,
                email: userData.email || "",
                firstName: userData.firstName || "",
                lastName: userData.lastName || "",
                phone: userData.phone || "",
                profileImage: userData.profileImage || null,
                userType: userData.userType || 'customer'
              } as UserData
            })
            return true
          } catch (error) {
            console.error("Registration failed:", error)
            return false
          }
        }
      }),
      { name: "auth-storage" }
    ),
    { name: "auth-store" }
  )
)