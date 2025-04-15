import { Outlet } from "react-router-dom";
// import {
//   ResizablePanelGroup,
//   ResizablePanel,
//   ResizableHandle,
// } from "@/components/ui/resizable";

const AuthLayout = () => {
  return (
    // <ResizablePanelGroup direction="vertical">
    //   <ResizablePanel defaultSize={100}>
    //     <div className="p-4 border-2 border-blue-500">
    //       <h1>Auth Layout</h1>
    //       <Outlet />
    //     </div>
    //   </ResizablePanel>
    //   <ResizableHandle />
    // </ResizablePanelGroup>

    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-2xl font-bold mb-4">Auth Layout</h1>
      <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-md">
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;
