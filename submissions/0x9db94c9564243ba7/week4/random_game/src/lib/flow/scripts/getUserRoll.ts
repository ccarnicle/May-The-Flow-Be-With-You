export const getUserRoll = `
import OnchainCraps from 0x2a0f8698a713c169

access(all)
fun main(parent: Address): OnchainCraps.GameData? {
    let userAccount = getAuthAccount<auth(BorrowValue) &Account>(parent)
    let crapsGameRef = userAccount.storage.borrow<&OnchainCraps.Game>(from: OnchainCraps.GameStoragePath)
    if crapsGameRef == nil {
        return nil
    }

    return crapsGameRef!.getGameInfo()
}
`; 