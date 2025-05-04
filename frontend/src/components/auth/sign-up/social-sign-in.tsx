"use client"
import { Button } from "@/components/ui/button"
import { useGoogleLogin } from '@react-oauth/google'
import { toast } from "sonner"
import { useEffect } from "react"
import { Loader2 } from "lucide-react"

// Add type declaration for Google's global objects
interface GoogleAccountsObj {
  accounts: any;
}

// Extend the global Window interface
declare global {
  interface Window {
    google?: GoogleAccountsObj;
  }
}

interface SocialSignInProps {
  onGoogleSignIn: (googleData: any) => void
  isSignUp?: boolean
  isLoading?: boolean
}

export function SocialSignIn({ onGoogleSignIn, isSignUp = false, isLoading = false }: SocialSignInProps) {
  // Log when the component mounts to check if Google OAuth is available
  useEffect(() => {
    if (typeof window !== 'undefined') {
      console.log('Google OAuth client check:', {
        clientExists: !!window.google,
        accountsExists: !!window.google?.accounts
      });
    }
  }, []);

  const login = useGoogleLogin({
    onSuccess: tokenResponse => {
      console.log('Google login successful, token received');
      // Pass the access token to our handler
      onGoogleSignIn(tokenResponse);
    },
    onError: error => {
      console.error('Google login failed:', error);
      toast.error("Google sign-in failed. Please try again.");
    },
    flow: 'implicit', // Explicitly set the flow type
    scope: 'email profile',
    prompt: 'select_account'  // Force account selection every time
  });

  return (
    <>
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-muted-foreground">Or continue with</span>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full flex items-center justify-center"
        onClick={() => {
          console.log('Google sign-in button clicked');
          login();
        }}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            <span>Processing...</span>
          </>
        ) : (
          <>
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
              <path d="M1 1h22v22H1z" fill="none" />
            </svg>
            {isSignUp ? 'Sign up with Google' : 'Sign in with Google'}
          </>
        )}
      </Button>
    </>
  )
}
