import mongoose from 'mongoose'
import ApplicantReport, { IApplicantReport } from '../models/applicantReportModel'

const applicantReportService = {
    getApplicantReport: async (query: Partial<IApplicantReport>): Promise<IApplicantReport> => {
        return await ApplicantReport.findById(query).populate({
            path: 'createdBy',
            select: '-_id name email image',
            populate: { path: 'role', select: 'roleName -_id' },
        })
    },
    updateApplicantReport: async (
        id: mongoose.Types.ObjectId,
        newApplicantReport: Partial<IApplicantReport>,
    ): Promise<IApplicantReport> => {
        return await ApplicantReport.findByIdAndUpdate(id, newApplicantReport, { new: true }).populate({
            path: 'createdBy',
            select: '-_id name email image role',
            populate: { path: 'role', select: 'roleName -_id' },
        })
    },
    addApplicantReport: async (applicantReport: Partial<IApplicantReport>): Promise<IApplicantReport> => {
        return (await ApplicantReport.create(applicantReport)).populate({
            path: 'createdBy',
            select: '-_id name email image',
            populate: { path: 'role', select: 'roleName -_id' },
        })
    },
}

export default applicantReportService
