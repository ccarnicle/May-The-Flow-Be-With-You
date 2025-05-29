// Basic Transfer
import "aiSportsJuice"
import "FungibleToken"
import "OnchainCraps"

// This transaction is used to withdraw and deposit tokens with a Vault

transaction(amount: UFix64) {

  prepare(signer: auth(BorrowValue) &Account) {

        // Get a reference to the signer's stored vault
        let vaultRef = signer.storage.borrow<auth(FungibleToken.Withdraw) &aiSportsJuice.Vault>
                       (from: /storage/aiSportsJuiceVault)
                       ?? panic("Could not borrow reference to the owner's Vault!")

        // Withdraw tokens from the signer's stored vault
        let sentVault <- vaultRef.withdraw(amount: amount)

        //get the reciever ref
        let diceVault = OnchainCraps.fundTokenVault(funds:  <-sentVault)

        log("Withdraw/Deposit succeeded!")
    }
}