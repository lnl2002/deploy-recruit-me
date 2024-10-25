import { Types } from 'mongoose'
import Account, { IAccount } from '../models/accountModel'

const accountService = {
    getAccountList: async (query: any, filteredQuery: any): Promise<{ accounts: IAccount[]; total: number }> => {
        const { sort_field = 'createdAt', order = 'asc', limit, skip } = query

        const total = await Account.countDocuments(filteredQuery)

        const accounts = await Account.find(filteredQuery)
            .populate('cvs')
            .populate('role')
            .populate('unit')
            .sort({ [sort_field]: order === 'asc' ? 1 : -1 })
            .limit(limit)
            .skip(skip)
            .lean()
            .exec()

        return { accounts, total }
    },
    getAccountById: async (accountId: Types.ObjectId): Promise<IAccount | null> => {
        const account = await Account.findById(accountId).populate('cvs').populate('role').populate('unit')
        return account
    },
    addAccount: async (account: Partial<IAccount>): Promise<IAccount> => {
        try {
            const newAccount = await Account.create(account)
            return newAccount
        } catch (error) {
            throw new Error('Could not found account')
        }
    },
}

export default accountService
