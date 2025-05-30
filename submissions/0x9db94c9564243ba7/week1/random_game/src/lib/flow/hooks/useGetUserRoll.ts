import * as fcl from "@onflow/fcl";
import { getUserRoll } from "../scripts/getUserRoll";

export const getUserRollData = async (address: string) => {
  try {
    // Ensure address is properly formatted
    const formattedAddress = address?.startsWith('0x') ? address : `0x${address}`;
    console.log("calling get user roll with formatted address: ", formattedAddress);
    
    const result = await fcl.query({
      cadence: getUserRoll,
      args: (arg: any, t: any) => [
        arg(formattedAddress || "0x0", t.Address) // Use a dummy address if null
      ],
    });


    console.log("query result: ", result)
    return {
      data: result,
      error: null,
      isLoading: false
    };
  } catch (error) {
    console.error("Flow API Error:", error);
    console.error("Error details:", JSON.stringify(error, null, 2));
    return {
      data: null,
      error,
      isLoading: false
    };
  }
}; 