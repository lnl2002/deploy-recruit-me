import mongoose, { Types } from 'mongoose'
import Apply, { IApply } from '..//models/applyModel'
import Job from '../models/jobModel'
import { textract } from '../configs/aws-config'
import Gemini from '../configs/gemini-config'
import { deleteS3File, pollTextractJob, uploadPdfToS3 } from '../utils/uploadPdfToS3'

const applyService = {
    updateStatus: async ({
        applyId,
        newStatusId,
    }: {
        applyId: string
        newStatusId: string
    }): Promise<IApply | null> => {
        try {
            // Validate applyId and newStatusId as ObjectIDs
            if (!mongoose.Types.ObjectId.isValid(applyId)) {
                throw new Error('Invalid applyId')
            }
            if (!mongoose.Types.ObjectId.isValid(newStatusId)) {
                throw new Error('Invalid newStatusId')
            }

            const updatedApply = await Apply.findByIdAndUpdate(applyId, { status: newStatusId }, { new: true })

            return updatedApply
        } catch (error) {
            // Handle errors (e.g., log and re-throw)
            console.error('Error updating application status in applyService:', error)
            throw error // Re-throw for the controller to handle
        }
    },

    getApplyListByJob: async (jobId: Types.ObjectId): Promise<IApply[] | []> => {
        const applies = await Apply.find({ job: jobId })
            .populate('cv')
            .populate('job')
            .populate('status')
            .populate('assigns')

        return applies
    },

    createApply: async ({ cvId, jobId, defaultStatusId, createdBy }) => {
        try {
            if (!mongoose.Types.ObjectId.isValid(cvId)) {
                throw new Error('Invalid cvId')
            }
            if (!mongoose.Types.ObjectId.isValid(jobId)) {
                throw new Error('Invalid jobId')
            }
            if (!mongoose.Types.ObjectId.isValid(createdBy)) {
                throw new Error('Invalid jobId')
            }
            if (!mongoose.Types.ObjectId.isValid(defaultStatusId)) {
                throw new Error('Invalid jobId')
            }
            const newApply = new Apply({ cv: cvId, job: jobId, status: defaultStatusId, createdBy: createdBy })
            const savedApply = await newApply.save()
            return savedApply
        } catch (error) {
            // Handle errors (e.g., log and re-throw)
            console.error('Error creating application in applyService:', error)
            throw error // Re-throw for the controller to handle
        }
    },

    // Chua hoan thien
    getApplyListByInterviewManager: async ({
        page = 1,
        limit = 10,
        sort = 'desc',
        userId,
    }: {
        page: number
        limit: number
        sort: string
        userId: string
    }) => {
        const skip = (page - 1) * limit

        const totalApplications = await Apply.countDocuments({ interviewManager: userId })
        const applications = await Apply.find({ interviewManager: userId })
            .populate('cv')
            .populate('status')
            .sort({ createdAt: sort === 'asc' ? 1 : -1 })
            .skip(skip)
            .limit(limit)

        return {
            total: totalApplications,
            page,
            totalPages: Math.ceil(totalApplications / limit),
            data: applications,
        }
    },

    getApplyById: async (id: mongoose.Types.ObjectId): Promise<IApply> => {
        return await Apply.findById(id)
            .populate('cv')
            .populate('job')
            .populate('status')
            .populate('assigns')
            .populate('applicantReports')
            .populate('statusUpdatedBy')
    },

    // S3 textract
    extractTextFromPdf: async (cvContent: string, jobId: string, applyId: string): Promise<string> => {
        try {
            const job = await Job.findById(jobId).select('_id criterias').populate({
                path: 'criterias',
            })

            if (!job) {
                throw new Error(`Job ${jobId} not found`)
            }

            // update
            const criterias = JSON.stringify(job.criterias)

            const gemini = new Gemini()
            const result = await gemini.processCV({
                cvContent: cvContent,
                criteriaContent: criterias,
            })
            const score = JSON.parse(result)
            const averageScore = calculateAverageScore(score)

            await Apply.updateOne(
                {
                    _id: applyId,
                },
                {
                    cvScore: {
                        averageScore: averageScore,
                        detailScore: score,
                    },
                },
            )

            return JSON.parse(result)
        } catch (error) {
            console.error('Error extracting text:', error)
        }
    },

    textractPdf: async (filePath: string) => {
        try {
            // Tải file PDF lên S3
            const s3Key = await uploadPdfToS3(filePath)

            const startResponse = await textract
                .startDocumentTextDetection({
                    DocumentLocation: {
                        S3Object: {
                            Bucket: process.env.S3_BUCKET_TEXTRACT_NAME,
                            Name: s3Key,
                        },
                    },
                })
                .promise()

            console.log('tải lên s3')

            if (!startResponse.JobId) {
                throw new Error('Failed to start text detection job')
            }

            const textractJobId = startResponse.JobId

            // Chờ job Textract hoàn tất
            const extractedText = await pollTextractJob(textractJobId)

            console.log('done textract')

            // xóa file trên s3
            deleteS3File({
                fileName: s3Key,
            })

            //use gemini
            const gemini = new Gemini()
            const result = await gemini.analyzeCV({
                cvContent: extractedText,
            })

            console.log('done gemini')

            return JSON.parse(result)
        } catch (error) {
            console.error('Error extracting text:', error)
        }
    },

    updateApply: async (id: mongoose.Types.ObjectId, newApply: Partial<IApply>): Promise<IApply> => {
        return await Apply.findByIdAndUpdate(id, newApply, {
            new: true,
        })
    },

    getReports: async (id: string) => {
        const data = await Apply.findById(id)
            .select('_id applicantReports')
            .populate({
                path: 'applicantReports',
                populate: {
                    path: 'createdBy',
                    select: '_id email image name',
                },
            })

        return data?.applicantReports || []
    },
}
const calculateAverageScore = (criteria: { score: string }[]): string => {
    let totalAchieved = 0 // Tổng điểm đạt được
    let totalPossible = 0 // Tổng điểm tối đa

    for (const criterion of criteria) {
        const [achieved, possible] = criterion.score.split('/').map(Number)
        totalAchieved += achieved
        totalPossible += possible
    }

    const ave = totalPossible > 0 ? (totalAchieved / totalPossible) * 10 : 0
    // Tính trung bình theo công thức: (tổng đạt được / tổng tối đa) * 10
    return roundToTwoDecimals(ave)
}

const roundToTwoDecimals = (num: number): string => {
    const factor = Math.pow(10, 2) // Nhân với 10^2 để xử lý phần thập phân
    const rounded = Math.round(num * factor) / factor // Làm tròn với Math.round
    return `${rounded.toString()}/10` // Trả về chuỗi để hiển thị đúng
}

export default applyService
