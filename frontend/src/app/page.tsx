import { Button } from "@/components/ui/button";
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
        <Button>Hello</Button>
        <ResizablePanel>Two</ResizablePanel>
      </ResizablePanelGroup>
      ;
    </div>
  );
};

export default page;
