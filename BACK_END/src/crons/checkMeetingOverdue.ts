import cron from 'node-cron'
import meetingService from '../services/meetingRoom'
import Apply from '../models/applyModel'
import CVStatus from '../models/cvStatusModel'
import { IJob } from '../models/jobModel'
import { sendMessageToQueue } from '../configs/aws-queue'
import { S3_QUEUE_URL } from '../utils/env'

// Cron job mỗi 00:00
cron.schedule('0 0 * * *', async () => {
    try {
        console.log('Running cron job to check meeting rooms overdue...')

        const overdue = await meetingService.getMeetingOverdue()
        if (overdue && overdue.length > 0) {
            const status = await CVStatus.findOne({
                name: 'Rejected',
            })
            overdue.forEach(async (meeting) => {
                if (meeting?.participants?.length > 0 && meeting?.apply) {
                    const userInfo = meeting?.participants[0].participantDetails
                    const data = await Apply.findByIdAndUpdate(meeting.apply, {
                        status: status._id,
                    }).populate({
                        path: 'job',
                        select: 'title',
                    })

                    await sendMessageToQueue(
                        S3_QUEUE_URL,
                        JSON.stringify({
                            sendTo: [userInfo.email],
                            subject: 'Application Status Update',
                            body: `
                            <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); max-width: 600px; margin: 0 auto;">
                                <p style="font-size: 16px; margin-bottom: 20px;">Dear <strong>${userInfo.name}</strong>,</p>

                                <p style="font-size: 16px; margin-bottom: 20px;">Thank you for your interest in the <strong>${(data.job as IJob)?.title || ''}</strong> role at <strong>RecruitMe</strong>.</p>

                                <p style="font-size: 16px; margin-bottom: 20px;">We regret to inform you that your application can no longer be considered. This decision is due to the fact that you did not accept the interview schedule within the designated timeframe.</p>

                                <p style="font-size: 16px; margin-bottom: 20px;">We truly appreciate your interest in joining our team and encourage you to apply for other opportunities with us in the future.</p>

                                <p style="font-size: 16px; margin-bottom: 20px;">Wishing you the best in your career endeavors.</p>

                                <p style="font-size: 16px; margin-bottom: 20px;">Best regards,<br>
                                <strong>RecruitMe</strong><br>
                                recruitme@gmail.com</p>
                            </div>
                        `,
                        }),
                        'meeting-email-group',
                    )
                }
            })
        }
    } catch (error) {
        console.error('Error in cron job:', error)
    }
})
