"use client"

import { useEffect } from 'react'
import { GoogleOAuthProvider } from '@react-oauth/google'

export function Providers({
  children,
}: {
  children: React.ReactNode
}) {
  const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ''
  
  // Add debug logging
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (!GOOGLE_CLIENT_ID) {
        console.error('Google Client ID is missing. Check your .env.local file.');
      } else {
        console.log('Google Client ID loaded:', 
          GOOGLE_CLIENT_ID.substring(0, 5) + '...' + 
          GOOGLE_CLIENT_ID.substring(GOOGLE_CLIENT_ID.length - 5));
      }
    }
  }, [GOOGLE_CLIENT_ID]);
  
  return (
    <GoogleOAuthProvider 
      clientId={GOOGLE_CLIENT_ID}
      onScriptLoadError={() => {
        console.error('Failed to load Google OAuth script');
      }}
    >
      {children}
    </GoogleOAuthProvider>
  )
}