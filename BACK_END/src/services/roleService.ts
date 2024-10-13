import { Types } from 'mongoose'
import Role, { IRole } from '../models/roleModel'

const roleService = {
    addRole: async (role: Partial<IRole>): Promise<IRole> => {
        const newRole = await Role.create(role)
        return newRole
    },
    getListRole: async (): Promise<IRole[] | []> => {
        const listRole = await Role.find({})
        return listRole
    },
    getRoleById: async (roleId: Types.ObjectId): Promise<IRole> => {
        const role = await Role.findById(roleId)
        return role
    },
}

export default roleService
