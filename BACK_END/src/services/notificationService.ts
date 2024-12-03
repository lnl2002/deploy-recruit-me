import Notification from '~/models/notificationModel'

const notificationService = {
    insertNotification: async (receiverId, content, url) => {
        const notification = new Notification({
            receiver: receiverId,
            content,
            url,
            seen: false,
        })
        await notification.save()
        return notification
    },

    updateNotification: async (notificationId, updates) => {
        const notification = await Notification.findByIdAndUpdate(notificationId, updates, { new: true })
        return notification
    },

    getNotifications: async (receiverId) => {
        const notifications = await Notification.find({ receiver: receiverId }).sort({ createdAt: -1 })
        return notifications
    },

    markAsSeen: async (notificationId) => {
        const notification = await Notification.findByIdAndUpdate(notificationId, { seen: true }, { new: true })
        return notification
    },
}
export default notificationService