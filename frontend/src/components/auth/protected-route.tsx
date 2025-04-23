"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Array<"customer" | "driver" | "restaurant" | "admin">;
}

export function ProtectedRoute({ 
  children, 
  allowedRoles = ["customer", "driver", "restaurant", "admin"]
}: ProtectedRouteProps) {
  const router = useRouter();
  const { status, userType } = useAuthStore();
  
  useEffect(() => {
    // If not authenticated, redirect to login
    if (status === "unauthenticated") {
      router.replace("/sign-in");
      return;
    }
    
    // If authenticated but not in allowed roles, redirect to appropriate page
    if (status === "authenticated" && userType && !allowedRoles.includes(userType)) {
      router.replace("/unauthorized");
    }
  }, [status, userType, router, allowedRoles]);
  
  // Show loading state while checking auth
  if (status === "loading" || status === "unauthenticated") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-opacity-50 border-t-primary rounded-full"></div>
      </div>
    );
  }
  
  // If authenticated and in allowed roles, show children
  return <>{children}</>;
}