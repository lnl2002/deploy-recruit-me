import roleService from '../roleService'
import Role, { IRole } from '../../models/roleModel'
import { Types } from 'mongoose'

// Mock Mongoose Role model
jest.mock('../../models/roleModel', () => {
    const mockRoleModel = {
        create: jest.fn(),
        find: jest.fn(),
        findById: jest.fn(),
    }
    return {
        __esModule: true,
        default: mockRoleModel,
        IRole: {} as IRole,
    }
})

describe('roleService', () => {
    const mockRoleData = {
        _id: new Types.ObjectId(),
        name: 'Admin',
        description: 'Admin role with full permissions',
    }

    afterEach(() => {
        jest.clearAllMocks()
    })

    /** Test addRole */
    describe('addRole', () => {
        it('should successfully add a role', async () => {
            ;(Role.create as jest.Mock).mockResolvedValue(mockRoleData)

            const result = await roleService.addRole(mockRoleData)

            expect(Role.create).toHaveBeenCalledWith(mockRoleData)
            expect(result).toEqual(mockRoleData)
        })

        it('should throw an error if database fails', async () => {
            ;(Role.create as jest.Mock).mockRejectedValue(new Error('Database Error'))

            await expect(roleService.addRole(mockRoleData)).rejects.toThrow('Database Error')
        })

        it('should pass empty role input', async () => {
            const emptyRole = {}
            ;(Role.create as jest.Mock).mockResolvedValue(emptyRole)

            const result = await roleService.addRole(emptyRole)

            expect(Role.create).toHaveBeenCalledWith(emptyRole)
            expect(result).toEqual(emptyRole)
        })

        it('should return created role with mocked database call', async () => {
            const newRole = { _id: new Types.ObjectId(), name: 'User', description: 'User role' }
            ;(Role.create as jest.Mock).mockResolvedValue(newRole)

            const result = await roleService.addRole(newRole)

            expect(result).toEqual(newRole)
            expect(Role.create).toHaveBeenCalled()
        })

        it('should return an error when database throws a timeout', async () => {
            ;(Role.create as jest.Mock).mockRejectedValueOnce(new Error('Timeout'))

            await expect(roleService.addRole(mockRoleData)).rejects.toThrow('Timeout')
        })

        it('should handle unexpected input gracefully', async () => {
            const invalidRole = { invalid: 'invalid' }
            ;(Role.create as jest.Mock).mockRejectedValueOnce(new Error('Invalid Input'))

            await expect(roleService.addRole(invalidRole)).rejects.toThrow('Invalid Input')
        })
    })

    /** Test getListRole */
    describe('getListRole', () => {
        it('should return a list of roles successfully', async () => {
            const mockRoles = [mockRoleData, { _id: new Types.ObjectId(), name: 'User' }]
            ;(Role.find as jest.Mock).mockResolvedValue(mockRoles)

            const result = await roleService.getListRole()

            expect(result).toEqual(mockRoles)
            expect(Role.find).toHaveBeenCalledWith({})
        })

        it('should return an empty list if no roles exist', async () => {
            ;(Role.find as jest.Mock).mockResolvedValue([])

            const result = await roleService.getListRole()

            expect(result).toEqual([])
            expect(Role.find).toHaveBeenCalledWith({})
        })

        it('should throw error during database failure', async () => {
            ;(Role.find as jest.Mock).mockRejectedValue(new Error('DB Error'))

            await expect(roleService.getListRole()).rejects.toThrow('DB Error')
        })

        it('should return roles even when partially mocked data is returned', async () => {
            const mockPartialRoles = [{ name: 'Admin' }]
            ;(Role.find as jest.Mock).mockResolvedValue(mockPartialRoles)

            const result = await roleService.getListRole()

            expect(result).toEqual(mockPartialRoles)
            expect(Role.find).toHaveBeenCalled()
        })

        it('should simulate an empty database edge case', async () => {
            ;(Role.find as jest.Mock).mockResolvedValue([])

            const result = await roleService.getListRole()

            expect(result).toEqual([])
        })

        it('should validate empty calls and return appropriately', async () => {
            ;(Role.find as jest.Mock).mockResolvedValue([])

            const result = await roleService.getListRole()

            expect(result).toEqual([])
        })
    })

    /** Test getRoleById */
    describe('getRoleById', () => {
        it('should return role if found', async () => {
            ;(Role.findById as jest.Mock).mockResolvedValue(mockRoleData)

            const result = await roleService.getRoleById(mockRoleData._id)

            expect(result).toEqual(mockRoleData)
            expect(Role.findById).toHaveBeenCalledWith(mockRoleData._id)
        })

        it('should return null if role is not found', async () => {
            ;(Role.findById as jest.Mock).mockResolvedValue(null)

            const result = await roleService.getRoleById(mockRoleData._id)

            expect(result).toBeNull()
            expect(Role.findById).toHaveBeenCalledWith(mockRoleData._id)
        })

        it('should throw error on database exception', async () => {
            ;(Role.findById as jest.Mock).mockRejectedValue(new Error('DB Connection Error'))

            await expect(roleService.getRoleById(mockRoleData._id)).rejects.toThrow('DB Connection Error')
        })

        it('should handle invalid roleId inputs', async () => {
            const invalidRoleId = 'invalidId'
            ;(Role.findById as jest.Mock).mockRejectedValue(new Error('Invalid ID'))

            await expect(roleService.getRoleById(invalidRoleId as any)).rejects.toThrow('Invalid ID')
        })

        it('should simulate a database failure during query', async () => {
            ;(Role.findById as jest.Mock).mockRejectedValueOnce(new Error('Timeout'))

            await expect(roleService.getRoleById(mockRoleData._id)).rejects.toThrow('Timeout')
        })

        it('should handle edge case for roleId edge limits', async () => {
            const largeId = new Types.ObjectId()
            ;(Role.findById as jest.Mock).mockResolvedValue(mockRoleData)

            const result = await roleService.getRoleById(largeId)

            expect(result).toEqual(mockRoleData)
            expect(Role.findById).toHaveBeenCalled()
        })
    })
})
