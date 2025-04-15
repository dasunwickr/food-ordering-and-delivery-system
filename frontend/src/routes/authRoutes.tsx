import { RouteObject } from "react-router-dom";
import LoginPage from "@/pages/common/auth/LoginPage";
import AuthLayout from "@/layouts/AuthLayout";

const authRoutes: RouteObject = {
  path: "auth",
  element: <AuthLayout />,
  children: [
    {
      path: "login",
      element: <LoginPage />,
    },
  ],
};

export default authRoutes;
