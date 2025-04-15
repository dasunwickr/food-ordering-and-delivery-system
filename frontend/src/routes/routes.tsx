import { createBrowserRouter, RouteObject } from "react-router-dom";
import authRoutes from "./authRoutes";

const routes: RouteObject[] = [
  authRoutes,
  {
    path: "*",
    element: <>404 Not Found</>,
  },
];

const router = createBrowserRouter(routes);
export default router;
