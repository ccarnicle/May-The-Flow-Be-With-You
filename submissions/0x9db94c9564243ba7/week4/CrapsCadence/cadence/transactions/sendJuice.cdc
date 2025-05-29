// Basic Transfer
import "aiSportsJuice"
import "FungibleToken"

// This transaction is used to withdraw and deposit tokens with a Vault

transaction(amount: UFix64, reciever: Address) {

  prepare(signer: auth(BorrowValue) &Account) {

        // Get a reference to the signer's stored vault
        let vaultRef = signer.storage.borrow<auth(FungibleToken.Withdraw) &aiSportsJuice.Vault>
                       (from: /storage/aiSportsJuiceVault)
                       ?? panic("Could not borrow reference to the owner's Vault!")

        // Withdraw tokens from the signer's stored vault
        let sentVault <- vaultRef.withdraw(amount: amount)

        //get the reciever ref
        let receiver = getAccount(reciever)
        let receiverRef = receiver.capabilities.borrow<&aiSportsJuice.Vault>(/public/aiSportsJuiceReceiver) ?? panic("Could not borrow receiver reference to the public aiSportsJuiceReceiver")
        // Deposit the withdrawn tokens in the recipient's receiver
        receiverRef.deposit(from: <-sentVault)

        log("Withdraw/Deposit succeeded!")
    }
}