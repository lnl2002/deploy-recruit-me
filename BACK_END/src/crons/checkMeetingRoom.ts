import cron from 'node-cron'
import meetingService from '../services/meetingRoom'

// Cron job mỗi 1 phút
cron.schedule('*/1 * * * *', async () => {
    try {
        console.log('Running cron job to check meeting rooms...')

        // Call service 1
        await meetingService.getMeetingRoomsOneHourFromNow()

        // Call service 2
        await meetingService.getMeetingRoomsFiveMinutesFromNow()

    } catch (error) {
        console.error('Error in cron job:', error)
    }
})
