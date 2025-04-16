import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

import React from "react";

const page = () => {
  return (
    <div>
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel>One</ResizablePanel>
        <ResizableHandle />
        <ResizablePanel>Two</ResizablePanel>
      </ResizablePanelGroup>
      ;
    </div>
  );
};

export default page;
