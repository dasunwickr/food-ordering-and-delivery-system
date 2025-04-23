"use client";

import Link from "next/link";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Mail, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/store/auth-store";

export default function ForgotPassword() {
  const {
    email,
    isLoading,
    isSent,
    error,
    setForgotPasswordField,
    handleForgotPassword,
    resetForgotPasswordForm
  } = useAuthStore();

  // Reset form on unmount
  useEffect(() => {
    return () => {
      resetForgotPasswordForm();
    };
  }, [resetForgotPasswordForm]);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await handleForgotPassword();
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

  if (isSent) {
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
          <h1 className="text-2xl font-bold">Check your email</h1>
          <p className="text-muted-foreground">
            We have sent a password recovery link to <strong>{email}</strong>
          </p>
        </div>

        <div className="space-y-4">
          <p className="text-sm text-center">
            Didn&apos;t receive the email? Check your spam folder or{" "}
            <button
              onClick={() => setForgotPasswordField("isSent", false)}
              className="text-primary hover:underline"
            >
              try again
            </button>
          </p>
          <Button asChild className="w-full">
            <Link href="/sign-in">Return to Sign In</Link>
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto p-6 space-y-8">
      <motion.div
        className="flex items-center mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Link
          href="/sign-in"
          className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Sign In
        </Link>
      </motion.div>

      <motion.div
        className="space-y-2 text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <h1 className="text-2xl font-bold">Forgot Password</h1>
        <p className="text-muted-foreground">
          Enter your email address and we'll send you a link to reset your password
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
          <Label htmlFor="email" className="text-sm font-medium">
            Email Address
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              className="pl-10"
              value={email}
              onChange={(e) => setForgotPasswordField("email", e.target.value)}
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

        <motion.div custom={2} variants={itemVariants}>
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-opacity-50 border-t-transparent rounded-full" />
                Sending...
              </div>
            ) : (
              <div className="flex items-center">
                Send Reset Link
                <ArrowRight className="ml-2 h-4 w-4" />
              </div>
            )}
          </Button>
        </motion.div>
      </motion.form>
    </div>
  );
}
