import { config } from "@onflow/fcl";
import { useFlowConfig } from "@onflow/kit";

export const useFlowConfiguration = () => {
  const defaultConfig = {
    accessNodeUrl: "https://rest-testnet.onflow.org", // Flow Testnet Access Node
    flowNetwork: "testnet" as const,
    appDetail: {
      title: "Flow Dice Game",
      icon: "/dice-icon.png",
      description: "A decentralized dice game on Flow",
      url: "https://your-app-url.com", // Update this with your actual URL when deployed
    },
    // Initialize FCL config
    fclConfig: {
      "accessNode.api": "https://rest-testnet.onflow.org",
      "discovery.wallet": "https://fcl-discovery.onflow.org/testnet/authn",
      "discovery.authn.endpoint": "https://fcl-discovery.onflow.org/api/testnet/authn",
      "0xFlowToken": "0x7e60df042a9c0868", // Flow Token contract on testnet
    }
  };

  const kitConfig = useFlowConfig();
  
  return {
    ...defaultConfig,
    ...kitConfig
  };
}; 