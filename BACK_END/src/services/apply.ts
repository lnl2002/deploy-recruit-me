import mongoose, { Types } from 'mongoose'
import Apply, { IApply } from '..//models/applyModel'
import fs from 'fs'
import Job from '../models/jobModel'
import { textract } from '../configs/aws-config'
import Gemini from '../configs/gemini-config'

const applyService = {
    updateStatus: async ({
        applyId,
        newStatusId,
    }: {
        applyId: string
        newStatusId: string
    }): Promise<IApply | null> => {
        const updatedApply = await Apply.findByIdAndUpdate(applyId, { status: newStatusId }, { new: true })

        return updatedApply
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
            const newApply = new Apply({
                cv: cvId,
                job: jobId,
                status: defaultStatusId,
                createdBy: createdBy,
            })

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
    extractTextFromPdf: async (filePath: string, jobId: string, applyId: string): Promise<string> => {
        const fileContent = fs.readFileSync(filePath)
        const tieuChi = fs.readFileSync('D:/Ky9/OCR image to text/recruit_me.criterias.json', 'utf8')

        const params = {
            Document: {
                Bytes: fileContent,
            },
        }

        try {
            const job = await Job.findById(jobId);
            if(!job) {
                throw new Error(`Job ${jobId} not found`)
            }

            const response = await textract.detectDocumentText(params).promise()

            const extractedText = response.Blocks?.filter((block) => block.BlockType === 'LINE') // Lấy các dòng text
                .map((block) => block.Text) // Trích xuất text
                .join('\n') // Ghép thành chuỗi

            const gemini = new Gemini()
            const result = await gemini.processCV({
                cvContent: extractedText,
                criteriaContent: tieuChi,
            })
            const score = JSON.parse(result)
            const averageScore = calculateAverageScore(score)
            console.log({ averageScore })
            console.log(score)

            await Apply.updateOne({
                _id: applyId
            }, {
                cvScore: {
                    averageScore: averageScore,
                    detailScore: score
                }
            })

            return JSON.parse(result)
        } catch (error) {
            console.error('Error extracting text:', error)
        }
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
