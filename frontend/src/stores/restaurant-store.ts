import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

type Day = "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday"

interface OperatingHours {
  day: Day
  isOpen: boolean
  openTime: string
  closeTime: string
}

interface Document {
  name: string
  file: File | null
}

interface RestaurantState {
  // Basic info
  restaurantName: string
  address: string
  licenseNumber: string
  restaurantType: string
  cuisineTypes: string[]
  
  // Operating hours
  operatingHours: OperatingHours[]
  
  // Documents
  documents: Document[]
  
  // Location
  location: string
  locationConfirmed: boolean
  
  // UI state
  step: number
  showRestaurantTypeModal: boolean
  showCuisineTypesModal: boolean
  showMap: boolean
  showSuccessModal: boolean
  errors: { [key: string]: string }
  
  // Actions
  setRestaurantName: (name: string) => void
  setAddress: (address: string) => void
  setLicenseNumber: (license: string) => void
  setRestaurantType: (type: string) => void
  toggleCuisineType: (type: string) => void
  updateOperatingHours: (index: number, field: keyof OperatingHours, value: any) => void
  updateDocument: (index: number, file: File | null) => void
  addDocument: () => void
  setLocation: (location: string) => void
  confirmLocation: () => void
  setStep: (step: number) => void
  toggleModal: (modal: 'restaurantType' | 'cuisineTypes' | 'map' | 'success', isOpen: boolean) => void
  validateStep: (step: number) => boolean
  clearErrors: () => void
  resetStore: () => void
}

// Initial operating hours
const defaultOperatingHours: OperatingHours[] = [
  { day: "monday", isOpen: true, openTime: "09:00", closeTime: "22:00" },
  { day: "tuesday", isOpen: true, openTime: "09:00", closeTime: "22:00" },
  { day: "wednesday", isOpen: true, openTime: "09:00", closeTime: "22:00" },
  { day: "thursday", isOpen: true, openTime: "09:00", closeTime: "22:00" },
  { day: "friday", isOpen: true, openTime: "09:00", closeTime: "23:00" },
  { day: "saturday", isOpen: true, openTime: "10:00", closeTime: "23:00" },
  { day: "sunday", isOpen: true, openTime: "10:00", closeTime: "22:00" },
]

// Initial default documents
const defaultDocuments: Document[] = [
  { name: "Business License", file: null },
  { name: "Food Safety Certificate", file: null },
]

export const useRestaurantStore = create<RestaurantState>()(
  devtools(
    (set, get) => ({
      // Initial state
      restaurantName: "",
      address: "",
      licenseNumber: "",
      restaurantType: "",
      cuisineTypes: [],
      operatingHours: defaultOperatingHours,
      documents: defaultDocuments,
      location: "",
      locationConfirmed: false,
      step: 1,
      showRestaurantTypeModal: false,
      showCuisineTypesModal: false,
      showMap: false,
      showSuccessModal: false,
      errors: {},

      // Actions
      setRestaurantName: (name) => set({ restaurantName: name }),
      setAddress: (address) => set({ address }),
      setLicenseNumber: (license) => set({ licenseNumber: license }),
      setRestaurantType: (type) => set({ 
        restaurantType: type, 
        showRestaurantTypeModal: false 
      }),
      
      toggleCuisineType: (type) => {
        const currentTypes = get().cuisineTypes
        if (currentTypes.includes(type)) {
          set({ cuisineTypes: currentTypes.filter(t => t !== type) })
        } else {
          set({ cuisineTypes: [...currentTypes, type] })
        }
      },
      
      updateOperatingHours: (index, field, value) => {
        const updatedHours = [...get().operatingHours]
        updatedHours[index] = { ...updatedHours[index], [field]: value }
        set({ operatingHours: updatedHours })
      },
      
      updateDocument: (index, file) => {
        const updatedDocuments = [...get().documents]
        updatedDocuments[index].file = file
        set({ documents: updatedDocuments })
      },
      
      addDocument: () => set({ 
        documents: [...get().documents, { name: "", file: null }] 
      }),
      
      setLocation: (location) => set({ 
        location,
        locationConfirmed: false 
      }),
      
      confirmLocation: () => set({ 
        locationConfirmed: true,
        showMap: false 
      }),
      
      setStep: (step) => set({ step }),
      
      toggleModal: (modal, isOpen) => {
        switch (modal) {
          case 'restaurantType':
            set({ showRestaurantTypeModal: isOpen })
            break
          case 'cuisineTypes':
            set({ showCuisineTypesModal: isOpen })
            break
          case 'map':
            set({ showMap: isOpen })
            break
          case 'success':
            set({ showSuccessModal: isOpen })
            break
        }
      },
      
      validateStep: (step) => {
        const newErrors: { [key: string]: string } = {}
        let isValid = true
        
        if (step === 1) {
          const { restaurantName, address, licenseNumber, restaurantType, cuisineTypes } = get()
          
          if (!restaurantName) {
            newErrors.restaurantName = "Restaurant name is required"
            isValid = false
          }
          
          if (!address) {
            newErrors.address = "Address is required"
            isValid = false
          }
          
          if (!licenseNumber) {
            newErrors.licenseNumber = "License number is required"
            isValid = false
          }
          
          if (!restaurantType) {
            newErrors.restaurantType = "Restaurant type is required"
            isValid = false
          }
          
          if (cuisineTypes.length === 0) {
            newErrors.cuisineTypes = "At least one cuisine type is required"
            isValid = false
          }
        } 
        else if (step === 2) {
          // Operating hours validation if needed
          isValid = true
        }
        else if (step === 3) {
          const { documents, location, locationConfirmed } = get()
          
          const missingDocuments = documents.some((doc) => !doc.file)
          if (missingDocuments) {
            newErrors.documents = "All documents are required"
            isValid = false
          }
          
          if (!location) {
            newErrors.location = "Location is required"
            isValid = false
          }
          
          if (!locationConfirmed) {
            newErrors.locationConfirmed = "Please confirm your location on the map"
            isValid = false
          }
        }
        
        set({ errors: newErrors })
        return isValid
      },
      
      clearErrors: () => set({ errors: {} }),
      
      resetStore: () => set({
        restaurantName: "",
        address: "",
        licenseNumber: "",
        restaurantType: "",
        cuisineTypes: [],
        operatingHours: defaultOperatingHours,
        documents: defaultDocuments,
        location: "",
        locationConfirmed: false,
        step: 1,
        showRestaurantTypeModal: false,
        showCuisineTypesModal: false,
        showMap: false,
        showSuccessModal: false,
        errors: {},
      }),
    }),
    { name: "restaurant-store" }
  )
)