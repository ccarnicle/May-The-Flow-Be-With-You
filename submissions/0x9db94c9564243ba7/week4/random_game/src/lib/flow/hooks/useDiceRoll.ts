import * as fcl from "@onflow/fcl";
import { diceRollScript } from "../transactions/rollDiceCraps";

interface RollDiceParams {
  odds: string;
  amount: string;
}

export const rollDice = async ({ odds, amount }: RollDiceParams) => {
  try {
    const result = await fcl.mutate({
      cadence: diceRollScript,
      args: (arg: any, t: any) => [
        arg(odds, t.String),
        arg(amount, t.UFix64)
      ],
      proposer: fcl.currentUser,
      payer: fcl.currentUser,
      authorizations: [fcl.currentUser],
      limit: 100,
    });

    // Wait for transaction to be sealed
    const transaction = await fcl.tx(result).onceExecuted();
    console.log("=== Dice Roll Transaction Details ===");
    console.log("Transaction ID:", result);
    console.log("Status:", transaction.status);
    console.log("View on Flowscan:", `https://testnet.flowscan.org/transaction/${result}`);
    console.log("================================");
    console.log(transaction)

    return {
      txId: result,
      error: null
    };
  } catch (error) {
    console.error("Error rolling dice:", error);
    return {
      txId: null,
      error: error instanceof Error ? error : new Error(String(error))
    };
  }
}; 