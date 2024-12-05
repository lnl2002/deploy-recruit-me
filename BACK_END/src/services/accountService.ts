/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Types } from 'mongoose'
import Account, { IAccount, IAccoutStatus } from '../models/accountModel'
import Role from '../models/roleModel'

const accountService = {
    getAccountList: async (query: any, filteredQuery: any): Promise<{ accounts: IAccount[]; total: number }> => {
        const { sort_field = 'createdAt', order = 'asc', limit = 5, skip = 0, role } = query

        if(limit < 0 || skip < 0){
            throw new Error('BAD_REQUEST');
        }

        if (role) {
            const roleInfo = await Role.findOne({
                roleName: role,
            })

            if(!roleInfo) {
                return {
                    accounts: [],
                    total: 0
                }
            }

            filteredQuery.role = roleInfo._id
        }

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
        } catch (error: any) {
            throw new Error('Could not found account')
        }
    },

    // get interviewer and interview_manager with same unit
    getInterviewerByUnit: async (unitId: string) => {
        const roleInterviewer = await Role.findOne({
            roleName: 'INTERVIEWER',
        })

        const roleInterviewManager = await Role.findOne({
            roleName: 'INTERVIEW_MANAGER',
        })

        if (!roleInterviewer) {
            console.log('Cannot find INTERVIEWER role')
            return []
        }

        if (!roleInterviewManager) {
            console.log('Cannot find INTERVIEW_MANAGER role')
            return []
        }

        const listInterviewer = await Account.find({
            role: { $in: [roleInterviewer._id, roleInterviewManager._id] },
            unit: unitId,
        }).select('_id email name image')

        return listInterviewer
    },

    updateStatus: async (accountId: string, newStatus: IAccoutStatus) => {
        // Find the account by ID and update its status
        const updatedAccount = await Account.findByIdAndUpdate(
            accountId,
            { status: newStatus },
            { new: true, runValidators: true },
        )
        return updatedAccount
    },

    createAccount: async (accountData: Partial<IAccount>) => {
        const account = new Account({
            ...accountData,
        })

        return await account.save()
    },
}

export default accountService
