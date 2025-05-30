import React, { useEffect } from "react";
import { FlowProvider as KitFlowProvider } from "@onflow/kit";
import { useFlowConfiguration } from "./config";
import { config } from "@onflow/fcl";

interface FlowProviderProps {
  children: React.ReactNode;
}

export function FlowProvider({ children }: FlowProviderProps) {
  const flowConfig = useFlowConfiguration();
  
  useEffect(() => {
    // Initialize FCL with the configuration
    if (flowConfig.fclConfig) {
      config(flowConfig.fclConfig);
    }
  }, [flowConfig]);
  
  return (
    <KitFlowProvider config={flowConfig}>
      {children}
    </KitFlowProvider>
  );
} 