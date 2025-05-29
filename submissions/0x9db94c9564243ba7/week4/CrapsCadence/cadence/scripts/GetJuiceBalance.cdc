import "FungibleToken"
import "aiSportsJuice"
import "FungibleTokenMetadataViews"

access(all) fun main(address: Address): UFix64 {
    let vaultData = aiSportsJuice.resolveContractView(resourceType: nil, viewType: Type<FungibleTokenMetadataViews.FTVaultData>()) as! FungibleTokenMetadataViews.FTVaultData?
        ?? panic("Could not get vault data view for the contract")

    return getAccount(address).capabilities.borrow<&{FungibleToken.Balance}>(
            vaultData.metadataPath
        )?.balance
        ?? panic("Could not borrow Balance reference to the Vault")
}