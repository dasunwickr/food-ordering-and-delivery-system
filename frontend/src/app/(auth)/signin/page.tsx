import SignInForm from "@/components/common/auth/signin/SignInForm";
import Link from "next/link";

const LoginPage = () => {
  return (
    <div className="w-full max-w-md mx-auto">
      {/* Page Title */}
      <h1 className="text-3xl font-semibold text-left mb-6">Sign In</h1>

      {/* Sign In Form */}
      <SignInForm />

      {/* Links */}
      <div className="flex justify-between mt-4 text-sm">
        <Link href="/forgot-password" className="text-primary hover:underline">
          Forgot password?
        </Link>
        <Link href="/signup" className="text-primary hover:underline">
          Don&apos;t have an account? Sign up
        </Link>
      </div>
    </div>
  );
};

export default LoginPage;
