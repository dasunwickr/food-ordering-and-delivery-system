import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export type UserType = "customer" | "driver" | "restaurant" | null;
export type AuthStatus = "authenticated" | "unauthenticated" | "loading";

export interface Location {
  lat: number;
  lng: number;
  address: string;
}

// User state
interface UserState {
  id: string | null;
  email: string;
  firstName: string | null;
  lastName: string | null;
  userType: UserType;
  profileImageUrl: string | null;
  status: AuthStatus;
  accessToken: string | null;
}

// Auth methods
interface AuthActions {
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  verifyResetToken: (token: string) => Promise<boolean>;
}

// Sign In state and actions
interface SignInState {
  email: string | null;
  password: string;
  rememberMe: boolean;
  isLoading: boolean;
  error: string | null;
}

interface SignInActions {
  setSignInField: <K extends keyof SignInState>(field: K, value: SignInState[K]) => void;
  resetSignInForm: () => void;
  handleSignIn: () => Promise<void>;
  validateSignInForm: () => boolean;
}

// Forgot Password state and actions
interface ForgotPasswordState {
  email: string;
  isLoading: boolean;
  isSent: boolean;
  error: string | null;
}

interface ForgotPasswordActions {
  setForgotPasswordField: <K extends keyof ForgotPasswordState>(field: K, value: ForgotPasswordState[K]) => void;
  resetForgotPasswordForm: () => void;
  handleForgotPassword: () => Promise<void>;
  validateForgotPasswordForm: () => boolean;
}

// Reset Password state and actions
interface ResetPasswordState {
  password: string;
  confirmPassword: string;
  isLoading: boolean;
  isSuccess: boolean;
  error: string | null;
}

interface ResetPasswordActions {
  setResetPasswordField: <K extends keyof ResetPasswordState>(field: K, value: ResetPasswordState[K]) => void;
  resetResetPasswordForm: () => void;
  handleResetPassword: (token: string) => Promise<void>;
  validateResetPasswordForm: () => boolean;
}

// Sign Up state and actions (existing)
interface SignUpFormState {
  // Step 1: Account credentials
  email: string;
  password: string;
  confirmPassword: string;
  
  // Step 2: Personal information
  firstName: string;
  lastName: string;
  phone: string;
  profileImage: File | null;
  profileImageUrl: string | null;
  
  // Step 3: User type specific
  userType: UserType;
  
  // Customer specific
  location: Location;
  
  // Restaurant specific
  restaurantName: string;
  restaurantLicenseNumber: string;
  restaurantType: string;
  restaurantLocation: Location;
  
  // Driver specific
  vehicleType: string;
  vehiclePlateNumber: string;
  licenseNumber: string;
  
  // Form control
  step: number;
  errors: Record<string, string>;
  showUserTypeModal: boolean;
}

interface SignUpFormActions {
  // Basic form actions
  setField: <K extends keyof SignUpFormState>(field: K, value: SignUpFormState[K]) => void;
  reset: () => void;
  
  // Navigation actions
  nextStep: () => void;
  prevStep: () => void;
  
  // Form validation
  validateStep1: () => boolean;
  validateStep2: () => boolean;
  validateCustomerStep: () => boolean;
  validateRestaurantStep: () => boolean;
  validateDriverStep: () => boolean;
  
  // UI control
  setErrors: (errors: Record<string, string>) => void;
  setShowUserTypeModal: (show: boolean) => void;
  setUserType: (type: UserType) => void;
  
  // Image handling
  handleProfileImageChange: (file: File | null) => void;
  
  // Submit
  handleSignUpSubmit: () => Promise<void>;
}

// Combined store types
type AuthStore = 
  UserState & 
  AuthActions &
  SignInState & SignInActions &
  ForgotPasswordState & ForgotPasswordActions &
  ResetPasswordState & ResetPasswordActions;

type SignUpStore = SignUpFormState & SignUpFormActions;

// Initial state for the auth store
const initialAuthState: UserState & SignInState & ForgotPasswordState & ResetPasswordState = {
  // User state
  id: null,
  email: '',
  firstName: null,
  lastName: null,
  userType: null,
  profileImageUrl: null,
  status: 'unauthenticated',
  accessToken: null,
  
  // Sign In state
  // Removed duplicate email property
  password: '',
  rememberMe: false,
  isLoading: false,
  error: null,
  
  // Forgot Password state
  isSent: false,
  
  // Reset Password state
  confirmPassword: '',
  isSuccess: false,
};

// Initial state for the sign-up form
const initialSignUpState: SignUpFormState = {
  email: "",
  password: "",
  confirmPassword: "",
  firstName: "",
  lastName: "",
  phone: "",
  profileImage: null,
  profileImageUrl: null,
  userType: null,
  location: { lat: 0, lng: 0, address: "" },
  restaurantName: "",
  restaurantLicenseNumber: "",
  restaurantType: "",
  restaurantLocation: { lat: 0, lng: 0, address: "" },
  vehicleType: "",
  vehiclePlateNumber: "",
  licenseNumber: "",
  step: 1,
  errors: {},
  showUserTypeModal: false,
};

// Auth Store (Sign In, Forgot Password, User state)
export const useAuthStore = create<AuthStore>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialAuthState,
        
        // Auth actions
        signIn: async (email, password) => {
          set({ isLoading: true, error: null });
          
          try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // TODO: Replace with actual API call
            if (email === 'test@example.com' && password === 'password') {
              set({
                id: '1',
                email,
                firstName: 'Test',
                lastName: 'User',
                userType: 'customer',
                profileImageUrl: null,
                status: 'authenticated',
                accessToken: 'fake-token',
                isLoading: false
              });
            } else {
              set({ error: 'Invalid email or password', isLoading: false });
            }
          } catch (error) {
            set({ error: 'An error occurred. Please try again.', isLoading: false });
          }
        },
        
        signOut: () => {
          set({
            id: null,
            email: undefined,
            firstName: null,
            lastName: null,
            userType: null,
            profileImageUrl: null,
            status: 'unauthenticated',
            accessToken: null
          });
        },
        
        forgotPassword: async (email) => {
          set({ isLoading: true, error: null, isSent: false });
          
          try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // TODO: Replace with actual API call
            set({ isLoading: false, isSent: true });
          } catch (error) {
            set({ error: 'An error occurred. Please try again.', isLoading: false });
          }
        },
        
        resetPassword: async (token, newPassword) => {
          set({ isLoading: true, error: null, isSuccess: false });
          
          try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // TODO: Replace with actual API call
            set({ isLoading: false, isSuccess: true });
          } catch (error) {
            set({ error: 'An error occurred. Please try again.', isLoading: false });
          }
        },
        
        verifyResetToken: async (token) => {
          set({ isLoading: true });
          
          try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // TODO: Replace with actual API call
            set({ isLoading: false });
            return true;
          } catch (error) {
            set({ isLoading: false });
            return false;
          }
        },
        
        // Sign In form actions
        setSignInField: (field, value) => {
          set({ [field]: value });
        },
        
        resetSignInForm: () => {
          set({
            email: '',
            password: '',
            rememberMe: false,
            error: null
          });
        },
        
        handleSignIn: async () => {
          if (get().validateSignInForm()) {
            const { email, password } = get();
            await get().signIn(email, password);
          }
        },
        
        validateSignInForm: () => {
          const { email, password } = get();
          let isValid = true;
          
          if (!email || !/\S+@\S+\.\S+/.test(email)) {
            set({ error: 'Please enter a valid email address' });
            isValid = false;
          } else if (!password) {
            set({ error: 'Please enter your password' });
            isValid = false;
          }
          
          return isValid;
        },
        
        // Forgot Password form actions
        setForgotPasswordField: (field, value) => {
          set({ [field]: value });
        },
        
        resetForgotPasswordForm: () => {
          set({
            email: '',
            error: null,
            isSent: false
          });
        },
        
        handleForgotPassword: async () => {
          if (get().validateForgotPasswordForm()) {
            const { email } = get();
            await get().forgotPassword(email);
          }
        },
        
        validateForgotPasswordForm: () => {
          const { email } = get();
          let isValid = true;
          
          if (!email || !/\S+@\S+\.\S+/.test(email)) {
            set({ error: 'Please enter a valid email address' });
            isValid = false;
          }
          
          return isValid;
        },
        
        // Reset Password form actions
        setResetPasswordField: (field, value) => {
          set({ [field]: value });
        },
        
        resetResetPasswordForm: () => {
          set({
            password: '',
            confirmPassword: '',
            error: null,
            isSuccess: false
          });
        },
        
        handleResetPassword: async (token) => {
          if (get().validateResetPasswordForm()) {
            const { password } = get();
            await get().resetPassword(token, password);
          }
        },
        
        validateResetPasswordForm: () => {
          const { password, confirmPassword } = get();
          let isValid = true;
          
          if (!password) {
            set({ error: 'Please enter a password' });
            isValid = false;
          } else if (password.length < 8) {
            set({ error: 'Password must be at least 8 characters' });
            isValid = false;
          } else if (password !== confirmPassword) {
            set({ error: 'Passwords do not match' });
            isValid = false;
          }
          
          return isValid;
        }
      }),
      {
        name: 'auth-store',
        partialize: (state) => ({
          id: state.id,
          email: state.email,
          firstName: state.firstName,
          lastName: state.lastName,
          userType: state.userType,
          profileImageUrl: state.profileImageUrl,
          status: state.status,
          accessToken: state.accessToken
        }),
      }
    ),
    { name: 'auth-state' }
  )
);

// Sign Up Store (kept separate to avoid persisting sensitive form data)
export const useSignUpStore = create<SignUpStore>()(
  devtools(
    (set, get) => ({
      ...initialSignUpState,
      
      // Basic form actions
      setField: (field, value) => {
        set({ [field]: value });
      },
      
      reset: () => {
        set(initialSignUpState);
      },
      
      // Navigation actions
      nextStep: () => {
        set(state => ({ step: state.step + 1 }));
      },
      
      prevStep: () => {
        set(state => ({ step: state.step - 1 }));
      },
      
      // Form validation
      validateStep1: () => {
        const { email, password, confirmPassword } = get();
        const newErrors: Record<string, string> = {};
        
        if (!email) {
          newErrors.email = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(email)) {
          newErrors.email = "Email is invalid";
        }
        
        if (!password) {
          newErrors.password = "Password is required";
        } else if (password.length < 8) {
          newErrors.password = "Password must be at least 8 characters";
        }
        
        if (password !== confirmPassword) {
          newErrors.confirmPassword = "Passwords do not match";
        }
        
        get().setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
      },
      
      validateStep2: () => {
        const { firstName, lastName, phone } = get();
        const newErrors: Record<string, string> = {};
        
        if (!firstName) {
          newErrors.firstName = "First name is required";
        }
        
        if (!lastName) {
          newErrors.lastName = "Last name is required";
        }
        
        if (!phone) {
          newErrors.phone = "Phone number is required";
        } else if (!/^\d{10}$/.test(phone.replace(/\D/g, ""))) {
          newErrors.phone = "Please enter a valid 10-digit phone number";
        }
        
        get().setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
      },
      
      validateCustomerStep: () => {
        const { location } = get();
        const newErrors: Record<string, string> = {};
        
        if (!location.address) {
          newErrors.location = "Please select a delivery location";
        }
        
        get().setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
      },
      
      validateRestaurantStep: () => {
        const { restaurantName, restaurantLicenseNumber, restaurantLocation } = get();
        const newErrors: Record<string, string> = {};
        
        if (!restaurantName) {
          newErrors.restaurantName = "Restaurant name is required";
        }
        
        if (!restaurantLicenseNumber) {
          newErrors.restaurantLicenseNumber = "License number is required";
        }
        
        if (!restaurantLocation.address) {
          newErrors.restaurantLocation = "Please select your restaurant location";
        }
        
        get().setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
      },
      
      validateDriverStep: () => {
        const { vehicleType, vehiclePlateNumber, licenseNumber } = get();
        const newErrors: Record<string, string> = {};
        
        if (!vehicleType) {
          newErrors.vehicleType = "Vehicle type is required";
        }
        
        if (!vehiclePlateNumber) {
          newErrors.vehiclePlateNumber = "Vehicle plate number is required";
        }
        
        if (!licenseNumber) {
          newErrors.licenseNumber = "License number is required";
        }
        
        get().setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
      },
      
      // UI controls
      setErrors: (errors) => {
        set({ errors });
      },
      
      setShowUserTypeModal: (show) => {
        set({ showUserTypeModal: show });
      },
      
      setUserType: (type) => {
        set({ 
          userType: type,
          showUserTypeModal: false,
          step: 3
        });
      },
      
      // Image handling
      handleProfileImageChange: (file) => {
        if (file) {
          set({ 
            profileImage: file,
            profileImageUrl: URL.createObjectURL(file)
          });
        } else {
          set({ 
            profileImage: null,
            profileImageUrl: null
          });
        }
      },
      
      // Submit sign-up form
      handleSignUpSubmit: async () => {
        const { userType } = get();
        let isValid = false;
        
        if (userType === 'customer') {
          isValid = get().validateCustomerStep();
        } else if (userType === 'restaurant') {
          isValid = get().validateRestaurantStep();
        } else if (userType === 'driver') {
          isValid = get().validateDriverStep();
        }
        
        if (isValid) {
          // TODO: Replace with actual API call
          try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // TODO: Handle successful signup
            console.log('Successfully signed up!');
            
            // Reset the form
            get().reset();
            
            // Redirect to sign-in page or onboarding
          } catch (error) {
            console.error('Error submitting form:', error);
          }
        }
      }
    }),
    { name: 'sign-up-store' }
  )
);