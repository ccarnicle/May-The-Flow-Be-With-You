import React, { useEffect, useState } from 'react';
import { rollDice } from '../../lib/flow/hooks/useDiceRoll';
import { getUserRollData } from '../../lib/flow/hooks/useGetUserRoll';
import * as fcl from "@onflow/fcl";

interface BetsSummary {
  ODDS: string;
  PASS: string;
}

interface GameData {
  betsSummary: BetsSummary;
  id: string;
  owner: string;
  point: string;
  state: string;
}

interface RollResult {
  diceOne: string;
  diceTwo: string;
  diceValue: string;
  rollResults: {
    bet: string;
    betAmount: string;
    resultAmount: string;
    status: string;
  }[];
}

interface DiceGameProps {
  scene: any; // This will be your Phaser scene instance
}

export const DiceGame: React.FC<DiceGameProps> = ({ scene }) => {
  console.log('DiceGame component mounted:', {
    sceneKey: scene?.scene?.key,
    hasScoreText: !!scene?.scoreText
  });

  const [userAddress, setUserAddress] = useState<string>('');
  const [gameData, setGameData] = useState<GameData | null>(null);
  const [rollResultData, setRollResultData] = useState<RollResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [rollError, setRollError] = useState<Error | null>(null);
  const [txId, setTxId] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    const getCurrentUser = async () => {
      const user = await fcl.currentUser().snapshot();
      if (user?.addr) {
        setUserAddress(user.addr);
      }
    };
    getCurrentUser();
  }, []);

  const [txStatus, setTxStatus] = useState<string>('');

  // Function to fetch user roll data
  const fetchUserRoll = async () => {
    if (!userAddress) return;
    
    setIsLoading(true);
    setRollError(null);
    try {
      const result = await getUserRollData(userAddress);
      setGameData(result.data);
      //setRollError(result.error);
      console.log("GameData: ", result.data)
    } catch (error) {
      setRollError(error instanceof Error ? error : new Error(String(error)));
    } finally {
      setIsLoading(false);
    }
  };

  // Handle initial user roll data load
  useEffect(() => {
    if (userAddress) {
      fetchUserRoll();
    }
  }, [userAddress, rollResultData]);

  useEffect(() => {
    console.log('DiceGame Effect:', { 
      sceneKey: scene?.scene?.key,
      isPending, 
      rollError,
      txId,
      txStatus,
      hasScoreText: !!scene?.scoreText
    });
    
    if (scene && scene.scoreText) {
      console.log('Updating score text:', { isPending, rollError, txStatus });
      
      if (rollError) {
        scene.updateScoreText('Transaction Error: ' + (rollError.message || 'Unknown error'));
        // Reset error state after displaying
        setTimeout(() => {
          scene.updateScoreText('Click to roll again');
        }, 3000);
      } else if (isPending) {
        scene.updateScoreText('Transaction pending...');
      } else if (txId) {
        scene.updateScoreText('Transaction confirmed! ID: ' + txId);
        // Fetch fresh data after successful roll
        fetchUserRoll();
      } else {
        scene.updateScoreText('Click to roll');
      }
    }
  }, [scene, isPending, rollError, txId, txStatus]);

  // Listen for dice roll complete event
  useEffect(() => {
    if (scene) {
      console.log('Setting up dice roll listener');
      const onDiceRollComplete = async () => {
        console.log('Dice roll complete');
        setTxStatus('initiating');
        setIsPending(true);
        setRollError(null);
        try {
          const result = await rollDice({
            odds: "FIELD",
            amount: "10.0"
          });
          setTxId(result.txId);
          
          if (!result.txId) {
            throw new Error('Transaction ID not received');
          }

          // Wait for transaction to be sealed
          const transaction = await fcl.tx(result.txId).onceExecuted();
          
          // Find RollCompleted event
          const rollCompletedEvent = transaction.events.find((event: any) => 
            event.type.includes('RollCompleted')
          );

          if (!rollCompletedEvent) {
            throw new Error('RollCompleted event not found in transaction');
          }

          // Extract and set roll result data
          const rollResult = rollCompletedEvent.data.result;
          setRollResultData(rollResult);
          console.log("Roll Result Data: ", rollResult);
          
          // Stop the rolling animation with the actual dice values
          if (scene.stopRollingAnimation) {
            scene.stopRollingAnimation(
              parseInt(rollResult.diceOne),
              parseInt(rollResult.diceTwo)
            );
          }

          // Update the results text
          if (scene.updateResultsText) {
            scene.updateResultsText(rollResult.rollResults);
          }
          
          setRollError(result.error);
        } catch (error) {
          setRollError(error instanceof Error ? error : new Error(String(error)));
          // Stop the rolling animation even if there's an error
          if (scene.stopRollingAnimation) {
            scene.stopRollingAnimation(1, 1); // Reset to default values
          }
          // Clear the results text on error
          if (scene.updateResultsText) {
            scene.updateResultsText([]);
          }
        } finally {
          setIsPending(false);
        }
      };
      
      scene.events.on('diceRollComplete', onDiceRollComplete);
      
      return () => {
        console.log('Cleaning up dice roll listener');
        scene.events.off('diceRollComplete', onDiceRollComplete);
      };
    }
  }, [scene]);

  return null; // This component doesn't render anything directly
}; 