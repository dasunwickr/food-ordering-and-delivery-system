"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

export default function Home() {
  const router = useRouter();

  // TODO : Check routing and authentication logic
  
  useEffect(() => {
    // Check if user is already authenticated
    const authToken = localStorage.getItem("authToken");
    const userType = localStorage.getItem("userType");
    
    if (authToken && userType) {
      // Redirect based on user type
      switch (userType.toLowerCase()) {
        case "admin":
          router.push("/admin");
          break;
        case "customer":
          router.push("/customer");
          break;
        case "restaurant":
          router.push("/restaurant");
          break;
        case "driver":
          router.push("/driver");
          break;
        default:
          router.push("/browse");
      }
    }
  }, [router]);

  return (
    <div>
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel>One</ResizablePanel>
        <ResizableHandle />
        <Button>Hello</Button>
        <ResizablePanel>Two</ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
