"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Lock, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/store/auth-store";

interface ResetPasswordPageProps {
  params: {
    token: string;
  };
}

export default function ResetPassword({ params }: ResetPasswordPageProps) {
  const router = useRouter();
  const {
    password,
    confirmPassword,
    isLoading,
    isSuccess,
    error,
    setResetPasswordField,
    handleResetPassword,
    resetResetPasswordForm,
    verifyResetToken
  } = useAuthStore();
  
  const [isTokenValid, setIsTokenValid] = useState<boolean | null>(null);
  const [isVerifying, setIsVerifying] = useState(true);

  // Verify token when component mounts
  useEffect(() => {
    const verify = async () => {
      setIsVerifying(true);
      const valid = await verifyResetToken(params.token);
      setIsTokenValid(valid);
      setIsVerifying(false);
    };
    
    verify();
  }, [params.token, verifyResetToken]);

  // Reset form on unmount
  useEffect(() => {
    return () => {
      resetResetPasswordForm();
    };
  }, [resetResetPasswordForm]);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await handleResetPassword(params.token);
  };

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

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.3,
        ease: "easeOut",
      },
    }),
  };

  if (isVerifying) {
    return (
      <div className="w-full max-w-md mx-auto p-6 flex flex-col items-center justify-center min-h-[300px]">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-opacity-50 border-t-primary rounded-full mb-4"></div>
        <p className="text-muted-foreground">Verifying your reset link...</p>
      </div>
    );
  }

  if (isTokenValid === false) {
    return (
      <motion.div
        className="w-full max-w-md mx-auto p-6 space-y-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="space-y-2 text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold">Invalid or Expired Link</h1>
          <p className="text-muted-foreground">
            The password reset link is invalid or has expired.
          </p>
        </div>

        <div className="space-y-4">
          <Button asChild className="w-full">
            <Link href="/forgot-password">Request a new reset link</Link>
          </Button>
        </div>
      </motion.div>
    );
  }

  if (isSuccess) {
    return (
      <motion.div
        className="w-full max-w-md mx-auto p-6 space-y-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="space-y-2 text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold">Password Reset Complete</h1>
          <p className="text-muted-foreground">
            Your password has been successfully reset. You can now sign in with your new password.
          </p>
        </div>

        <div className="space-y-4">
          <Button asChild className="w-full">
            <Link href="/sign-in">Go to Sign In</Link>
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto p-6 space-y-8">
      <motion.div
        className="space-y-2 text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <h1 className="text-2xl font-bold">Reset Your Password</h1>
        <p className="text-muted-foreground">
          Enter a new password for your account
        </p>
      </motion.div>

      <motion.form
        className="space-y-6"
        onSubmit={onSubmit}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div className="space-y-2" custom={1} variants={itemVariants}>
          <Label htmlFor="password" className="text-sm font-medium">
            New Password
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              className="pl-10"
              value={password}
              onChange={(e) => setResetPasswordField("password", e.target.value)}
              disabled={isLoading}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Password must be at least 8 characters long.
          </p>
        </motion.div>

        <motion.div className="space-y-2" custom={2} variants={itemVariants}>
          <Label htmlFor="confirmPassword" className="text-sm font-medium">
            Confirm Password
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              className="pl-10"
              value={confirmPassword}
              onChange={(e) => setResetPasswordField("confirmPassword", e.target.value)}
              disabled={isLoading}
            />
          </div>
        </motion.div>

        {error && (
          <motion.div
            className="p-3 rounded-md bg-red-50 text-red-600 text-sm"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
          >
            {error}
          </motion.div>
        )}

        <motion.div custom={3} variants={itemVariants}>
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-opacity-50 border-t-transparent rounded-full" />
                Resetting password...
              </div>
            ) : (
              <div className="flex items-center">
                Reset Password
                <ArrowRight className="ml-2 h-4 w-4" />
              </div>
            )}
          </Button>
        </motion.div>
      </motion.form>
    </div>
  );
}