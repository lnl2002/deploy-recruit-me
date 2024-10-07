import { Types } from 'mongoose'
import Account, { IAccount } from '../models/accountModel'

const accountService = {
    getAccountById: async (accountId: Types.ObjectId): Promise<IAccount | null> => {
        try {
            const account = await Account.findById(accountId).populate('cv').populate('role').populate('unit')
            return account
        } catch (error) {
            throw new Error('Could not found account')
        }
    },
}

export default accountService
