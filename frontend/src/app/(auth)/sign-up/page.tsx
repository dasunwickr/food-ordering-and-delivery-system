"use client"

import { useState, useEffect } from "react"
import { AnimatePresence } from "framer-motion"
import { useSearchParams } from "next/navigation"
import { BackButton } from "@/components/auth/back-button"
import { AuthHeader } from "@/components/auth/auth-header"
import { StepIndicator } from "@/components/auth/step-indicator"
import { AccountStep } from "@/components/auth/sign-up/account-step"
import { PersonalDetailsStep } from "@/components/auth/sign-up/personal-details-step"
import { CustomerSignUp } from "@/components/auth/sign-up/customer-signup"
import { DriverSignUp } from "@/components/auth/sign-up/driver-signup"
import { RestaurantSignUp } from "@/components/auth/sign-up/restaurant-signup"
import { UserTypeSelector } from "@/components/auth/user-type"
import { toast } from "sonner"
import { processGoogleAuth } from "@/utils/google-auth"
import { useRouter } from "next/navigation"
import { checkEmailExists } from "@/services/auth-service"

interface CustomerSignUpProps {
  userData: {
    email: string
    firstName: string
    lastName: string
    phone: string
    profileImage: string | null
    password: string
    provider?: string
  }
}

type UserType = "customer" | "driver" | "restaurant" | null

export default function SignUp() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [phone, setPhone] = useState("")
  const [profileImage, setProfileImage] = useState<File | null>(null)
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null)
  const [userType, setUserType] = useState<UserType>(null)
  const [showUserTypeModal, setShowUserTypeModal] = useState(false)
  const [isGoogleAuth, setIsGoogleAuth] = useState(false)
  const [googleAccessToken, setGoogleAccessToken] = useState<string | null>(null)
  const [googleId, setGoogleId] = useState<string | null>(null)

  // Check for Google auth data in URL
  useEffect(() => {
    const googleAuthParam = searchParams.get('googleAuth')
    if (googleAuthParam) {
      try {
        // Parse the Google auth data from the URL
        const googleData = JSON.parse(decodeURIComponent(googleAuthParam))
        
        // Process the Google data to pre-fill the form
        handleGoogleSignUp(googleData).catch(error => {
          console.error("Error processing Google auth data:", error)
          toast.error("There was a problem processing your Google account information")
        })
      } catch (error) {
        console.error("Error parsing Google auth data from URL:", error)
      }
    }
  }, [searchParams])

  const handleAccountSubmit = (email: string, password: string, confirmPassword: string) => {
    setEmail(email)
    setPassword(password)
    setStep(2)
  }

  const handlePersonalDetailsSubmit = (
    firstName: string,
    lastName: string,
    phone: string,
    profileImage: string | null,
  ) => {
    setFirstName(firstName)
    setLastName(lastName)
    setPhone(phone)
    setProfileImageUrl(profileImage)
    setShowUserTypeModal(true)
  }

  const handleUserTypeSelect = (type: UserType) => {
    setUserType(type)
    setShowUserTypeModal(false)
    setStep(3)
  }

  const handleGoogleSignUp = async (googleData: any) => {
    try {
      // Process the Google authentication data
      const userData = await processGoogleAuth(googleData);
      
      // Check if the email already exists
      const emailExists = await checkEmailExists(userData.email);
      
      if (emailExists.exists) {
        // If the email exists, redirect to sign in
        toast.info("Account exists", { 
          description: "An account with this email already exists. Redirecting to sign in.", 
          duration: 4000 
        });
        
        // Redirect to sign in after a short delay
        setTimeout(() => {
          router.push("/sign-in");
        }, 2000);
        return;
      }
      
      // Set user data from Google profile
      setEmail(userData.email);
      setFirstName(userData.firstName || "");
      setLastName(userData.lastName || "");
      setProfileImageUrl(userData.profilePictureUrl);
      setIsGoogleAuth(true);
      setGoogleAccessToken(userData.accessToken);
      setGoogleId(userData.googleId);
      
      // Skip to personal details step with pre-filled data
      setStep(2);
      
      toast.success("Google account connected", {
        description: "Your information has been pre-filled. Please complete your profile.",
      });
      
    } catch (error) {
      console.error("Google sign-up error:", error);
      toast.error("Google sign-up failed", {
        description: "There was a problem connecting your Google account. Please try again or use email registration.",
      });
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case 1:
        return "Set up your account credentials"
      case 2:
        return "Tell us about yourself"
      case 3:
        return `Complete your ${userType} profile`
      default:
        return ""
    }
  }

  return (
    <>
      <BackButton
        href={step === 1 ? "/sign-in" : undefined}
        onClick={step > 1 ? () => setStep(step - 1) : undefined}
        label={step === 1 ? "Back to Sign In" : "Back"}
      />

      <AuthHeader title="Create an Account" subtitle={getStepTitle()} />

      <StepIndicator
        steps={3}
        currentStep={step}
        onStepClick={(s) => {
          if (s < step) setStep(s)
        }}
      />

      <AnimatePresence mode="wait">
        {step === 1 && <AccountStep onSubmit={handleAccountSubmit} onGoogleSignUp={handleGoogleSignUp} />}
        {step === 2 && (
          <PersonalDetailsStep 
            onSubmit={handlePersonalDetailsSubmit} 
            initialData={{
              firstName,
              lastName,
              phone,
              profilePictureUrl: profileImageUrl
            }}
            isGoogleAuth={isGoogleAuth}
          />
        )}
        {step === 3 && (
          <>
            {userType === "customer" && (
              <CustomerSignUp
                userData={{
                  email,
                  password,
                  firstName,
                  lastName,
                  phone,
                  profileImage: profileImageUrl,
                  provider: isGoogleAuth ? "google" : undefined
                }}
                googleData={isGoogleAuth ? {
                  accessToken: googleAccessToken,
                  googleId: googleId
                } : undefined}
              />
            )}

            {userType === "driver" && (
              <DriverSignUp
                userData={{
                  email,
                  password,
                  firstName,
                  lastName,
                  phone,
                  profileImage: profileImageUrl,
                  provider: isGoogleAuth ? "google" : undefined
                }}
                googleData={isGoogleAuth ? {
                  accessToken: googleAccessToken,
                  googleId: googleId
                } : undefined}
              />
            )}

            {userType === "restaurant" && (
              <RestaurantSignUp
                userData={{
                  email,
                  password,
                  firstName,
                  lastName,
                  phone,
                  profileImage: profileImageUrl,
                  provider: isGoogleAuth ? "google" : undefined
                }}
                googleData={isGoogleAuth ? {
                  accessToken: googleAccessToken,
                  googleId: googleId
                } : undefined}
              />
            )}
          </>
        )}
      </AnimatePresence>

      <UserTypeSelector
        isOpen={showUserTypeModal}
        onClose={() => setShowUserTypeModal(false)}
        onSelect={handleUserTypeSelect}
      />
    </>
  )
}
