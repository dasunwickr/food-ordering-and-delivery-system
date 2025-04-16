"use client";

import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { loginSchema } from "@/validators/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import GoogleLoginButton from "@/components/common/auth/GoogleLoginButton";

const LoginForm = () => {
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (values: z.infer<typeof loginSchema>) => {
    console.log(values);
  };

  const handleGoogleLogin = () => {
    // Trigger Google login here (you can use next-auth or another method)
    console.log("Redirecting to Google login...");
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="you@example.com" {...field} />
              </FormControl>
              <FormDescription>
                We&apos;ll never share your email.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full btn-secondary">
          Sign In
        </Button>

        {/* Separator with "or" */}
        <div className="relative my-4 flex items-center">
          <div className="flex-grow border-t border-border" />
          <span className="mx-4 text-muted-foreground text-sm">or</span>
          <div className="flex-grow border-t border-border" />
        </div>

        {/* Google Login Button */}
        <GoogleLoginButton onClick={handleGoogleLogin} />
      </form>
    </Form>
  );
};

export default LoginForm;
