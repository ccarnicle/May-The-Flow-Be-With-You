#!/bin/bash
flow deploy
#setup accounts
echo "Creating Accounts"
flow accounts create --key 02063b160efa1b14d44bf2476ef3c9dccd10653f07adec9af147ca8dbfb013adcf1841fb2828e079758a13146e0d08c4230ae2a7a5da62d157ec638b7ff8f44a
flow accounts create --key c6c9003bed804ae5c0e231ceaf7d8008130c01da67995b2f167b753175ca5a11ea47366df835de47cba7a456086d4c77c79001520e23d33e378454b5e6accf65
flow accounts create --key 814b3a8ff8cba27e975e80b4d78ec439307f7f51ddefda9ad2a373a99a824683333ca4816d1329b6ff2931dcb6668f8caa9a155e5655aa5c79ad42ccee2f7556
#above accounts were only needed temporarily, real accounts below
flow accounts create --key 61010e062e9b28430d192f9ea5da1c480ba3c9605ca22438b40052a2fd0dc0443676fa0179fa4565620b7b4e9cc358487c3f4bf1e90ba667f5fe954a9a9c0cf8

flow transactions send cadence/transactions/SetupJuice.cdc --signer emulator-account-1
flow transactions send cadence/transactions/sendJuice.cdc 1000.0 '0x045a1763c93006ca'

flow transactions send cadence/transactions/FundTokenVault.cdc 10000.0

#example bets
#flow transactions send cadence/transactions/PlayCrapsBet.cdc "PASS" 3.0 --signer emulator-account-1
#flow scripts execute cadence/scripts/GetUserCrapsGame.cdc 0x045a1763c93006ca