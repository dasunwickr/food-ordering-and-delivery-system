"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, ShieldAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth-store";

export default function Unauthorized() {
  const { userType } = useAuthStore();
  
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut",
      },
    },
  };

  const getRedirectLink = () => {
    switch (userType) {
      case "customer":
        return "/browse";
      case "restaurant":
        return "/restaurant/dashboard";
      case "driver":
        return "/driver/dashboard";
      default:
        return "/";
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <motion.div
        className="text-center space-y-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
            <ShieldAlert className="h-10 w-10 text-red-600" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Access Denied</h1>
          <p className="text-muted-foreground">
            You don't have permission to access this page. This area might be restricted to certain user types.
          </p>
        </div>
        
        <div className="space-y-4 pt-4">
          <Button asChild className="w-full">
            <Link href={getRedirectLink()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go to Dashboard
            </Link>
          </Button>
          
          <p className="text-sm text-muted-foreground">
            If you believe this is an error, please contact support.
          </p>
        </div>
      </motion.div>
    </div>
  );
}