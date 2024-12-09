import notificationService from '../notificationService' // Điều chỉnh đường dẫn cho đúng
import Notification from '../../models/notificationModel'

jest.mock('../../models/notificationModel')

describe('notificationService', () => {
    describe('insertNotification', () => {
        beforeEach(() => {
            jest.clearAllMocks()
        })

        it('should create and return a new notification', async () => {
            const receiverId = 'receiver123'
            const content = 'Notification content'
            const url = 'http://example.com'

            const mockNotification = {
                receiver: receiverId,
                content,
                url,
                seen: false,
                save: jest.fn().mockResolvedValue(true),
            }

            Notification.mockImplementation(() => mockNotification)

            const result = await notificationService.insertNotification(receiverId, content, url)

            expect(Notification).toHaveBeenCalledWith({
                receiver: receiverId,
                content,
                url,
                seen: false,
            })
            expect(mockNotification.save).toHaveBeenCalled()
            expect(result).toBe(mockNotification)
        })

        it('should throw an error if saving notification fails', async () => {
            const receiverId = 'receiver123'
            const content = 'Notification content'
            const url = 'http://example.com'

            const mockNotification = {
                receiver: receiverId,
                content,
                url,
                seen: false,
                save: jest.fn().mockRejectedValue(new Error('Save failed')),
            }

            Notification.mockImplementation(() => mockNotification)

            await expect(notificationService.insertNotification(receiverId, content, url)).rejects.toThrow(
                'Save failed',
            )
        })

        it('should not create an empty notification', async () => {
            await expect(notificationService.insertNotification(null, '', '')).rejects.toThrow('Save failed')
        })

        it('should require receiverId', async () => {
            await expect(notificationService.insertNotification(null, 'Content', 'http://example.com')).rejects.toThrow(
                'Save failed',
            )
        })

        it('should require content', async () => {
            await expect(
                notificationService.insertNotification('receiver123', '', 'http://example.com'),
            ).rejects.toThrow('Save failed')
        })

        it('should require url', async () => {
            await expect(notificationService.insertNotification('receiver123', 'Content', null)).rejects.toThrow(
                'Save failed',
            )
        })
    })

    describe('updateNotification', () => {
        beforeEach(() => {
            jest.clearAllMocks()
        })

        it('should update and return the notification', async () => {
            const notificationId = 'notification123'
            const updates = { content: 'Updated content' }
            const mockUpdatedNotification = { ...updates, _id: notificationId }

            Notification.findByIdAndUpdate.mockResolvedValue(mockUpdatedNotification)

            const result = await notificationService.updateNotification(notificationId, updates)

            expect(Notification.findByIdAndUpdate).toHaveBeenCalledWith(notificationId, updates, { new: true })
            expect(result).toEqual(mockUpdatedNotification)
        })

        it('should return null if notification is not found', async () => {
            const notificationId = 'notification123'
            const updates = { content: 'Updated content' }

            Notification.findByIdAndUpdate.mockResolvedValue(null)

            const result = await notificationService.updateNotification(notificationId, updates)

            expect(result).toBeNull()
        })

        it('should handle errors when updating notification', async () => {
            const notificationId = 'notification123'
            const updates = { content: 'Updated content' }

            Notification.findByIdAndUpdate.mockRejectedValue(new Error('Update failed'))

            await expect(notificationService.updateNotification(notificationId, updates)).rejects.toThrow(
                'Update failed',
            )
        })

        it('should require notificationId', async () => {
            const updates = { content: 'Updated content' }
            await expect(notificationService.updateNotification(null, updates)).rejects.toThrow('Update failed')
        })

        it('should require updates object', async () => {
            const notificationId = 'notification123'
            await expect(notificationService.updateNotification(notificationId, null)).rejects.toThrow('Update failed')
        })

        it('should not update an empty notification', async () => {
            const notificationId = 'notification123'
            await expect(notificationService.updateNotification(notificationId, {})).rejects.toThrow('Update failed')
        })
    })

    describe('getNotifications', () => {
        beforeEach(() => {
            jest.clearAllMocks() // Dọn dẹp các mocks trước mỗi test case
        })

        it('should return notifications for the given receiverId', async () => {
            const receiverId = 'receiver123'
            const mockNotifications = [
                { content: 'Notification 1', createdAt: new Date('2023-01-01') },
                { content: 'Notification 2', createdAt: new Date('2023-01-02') },
            ]

            // Mock Notification.find để trả về các thông báo đã biết
            Notification.find.mockReturnValue({
                sort: jest.fn().mockResolvedValue(mockNotifications),
            })

            const result = await notificationService.getNotifications(receiverId)

            expect(Notification.find).toHaveBeenCalledWith({ receiver: receiverId })
            expect(result).toEqual(mockNotifications)
        })

        it('should return an empty array if no notifications are found', async () => {
            const receiverId = 'receiver123'

            // Mock không có thông báo nào được tìm thấy
            Notification.find.mockReturnValue({
                sort: jest.fn().mockResolvedValue([]),
            })

            const result = await notificationService.getNotifications(receiverId)

            expect(result).toEqual([]) // Kiểm tra kết quả trả về là mảng rỗng
        })

        it('should require a valid receiverId', async () => {
            await expect(notificationService.getNotifications(null)).rejects.toThrow('receiverId is required')
            await expect(notificationService.getNotifications('')).rejects.toThrow('receiverId is required')
        })

        it('should sort notifications by createdAt in descending order', async () => {
            const receiverId = 'receiver123'
            const mockNotifications = [
                { content: 'Notification 1', createdAt: new Date('2023-01-02') },
                { content: 'Notification 2', createdAt: new Date('2023-01-01') },
            ]

            // Mock Notification.find
            Notification.find.mockReturnValue({
                sort: jest.fn().mockResolvedValue(mockNotifications),
            })

            const result = await notificationService.getNotifications(receiverId)

            expect(Notification.find).toHaveBeenCalledWith({ receiver: receiverId })
            expect(result).toEqual(mockNotifications.sort((a, b) => b.createdAt - a.createdAt))
        })

        it('should deal with an error if sort fails', async () => {
            const receiverId = 'receiver123'
            const mockNotifications = [
                { content: 'Notification 1', createdAt: 'invalid-date' }, // Ngày không hợp lệ
            ]

            Notification.find.mockReturnValue({
                sort: jest.fn().mockResolvedValue(mockNotifications),
            })

            // Kiểm tra rằng hàm không ném lỗi nhưng trả về như đã định nghĩa
            const result = await notificationService.getNotifications(receiverId)
            expect(result).toEqual(mockNotifications)
        })
    })

    describe('markAsSeen', () => {
        beforeEach(() => {
            jest.clearAllMocks()
        })

        it('should mark the notification as seen and return it', async () => {
            const notificationId = 'notification123'
            const mockNotification = { seen: false, _id: notificationId }

            Notification.findByIdAndUpdate.mockResolvedValue(mockNotification)

            const result = await notificationService.markAsSeen(notificationId)

            expect(Notification.findByIdAndUpdate).toHaveBeenCalledWith(notificationId, { seen: true }, { new: true })
            expect(result).toEqual(mockNotification)
        })

        it('should return null if notification is not found', async () => {
            const notificationId = 'notification123'

            Notification.findByIdAndUpdate.mockResolvedValue(null)

            const result = await notificationService.markAsSeen(notificationId)

            expect(result).toBeNull()
        })

        it('should handle errors when marking as seen', async () => {
            const notificationId = 'notification123'

            Notification.findByIdAndUpdate.mockRejectedValue(new Error('Mark as seen failed'))

            await expect(notificationService.markAsSeen(notificationId)).rejects.toThrow('Mark as seen failed')
        })

        it('should require notificationId', async () => {
            await expect(notificationService.markAsSeen(null)).rejects.toThrow('Mark as seen failed')
        })

        it('should not mark an empty notification as seen', async () => {
            await expect(notificationService.markAsSeen('')).rejects.toThrow('Mark as seen failed')
        })

        it('should throw error if notificationId does not exist in database', async () => {
            const notificationId = '1234567890abcdef12345678'
            await expect(notificationService.markAsSeen(notificationId)).rejects.toThrow('Mark as seen failed')
        })
    })
})
