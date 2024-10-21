import { Request, Response } from "express";
import Apply from "../models/applyModel";
import CV from "../models/cvModel";
import Job from "../models/jobModel";
import CVStatus from "../models/cvStatusModel";
import applyService from "../services/apply";

const ApplyController = {
  // Create a new application
  applyToJob: async (req: Request, res: Response): Promise<void> => {
    try {
      // 1. Extract data from the request body
      const { cvId, jobId } = req.body;

      // 3. Find the CV, Job, and default CVStatus
      const [cv, job, defaultStatus] = await Promise.all([
        CV.findById(cvId),
        Job.findById(jobId),
        CVStatus.findOne({ name: "New" }), // Assuming "New" is a default status
      ]);

      const savedApply = await applyService.createApply({ cvId: cv._id, jobId: job._id, defaultStatusId: defaultStatus._id});

      // 7. Send a success response
      res.status(201).json({
        message: "Application created successfully",
        apply: savedApply,
      });
    } catch (error) {
      // 8. Handle errors
      console.error(error);
      res.status(500).json({ message: "Error creating application" });
    }
  },

  // Change application status
  changeStatus: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const updatedApply = await Apply.findByIdAndUpdate(
        id,
        { status },
        { new: true }
      );
      if (!updatedApply) {
        res.status(404).json({ message: "Application not found" });
        return;
      }
      res.status(200).json(updatedApply);
    } catch (error) {
      res.status(500).json({ message: "Error changing status", error });
    }
  },

  // Get all CVs by job ID
  getAllCVsByJobId: async (req: Request, res: Response): Promise<void> => {
    try {
        const { jobId } = req.params;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;

        const totalApplications = await Apply.countDocuments({ job: jobId });
        const applications = await Apply.find({ job: jobId })
          .populate("cv")
          .skip(skip)
          .limit(limit);

        res.status(200).json({
          total: totalApplications,
          page,
          totalPages: Math.ceil(totalApplications / limit),
          data: applications,
        });
    } catch (error) {
      res.status(500).json({ message: "Error fetching CVs", error });
    }
  },

  // Get application by ID
  getApplicationById: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const application = await Apply.findById(id).populate(
        "cv job status assigns"
      );
      if (!application) {
        res.status(404).json({ message: "Application not found" });
        return;
      }
      res.status(200).json(application);
    } catch (error) {
      res.status(500).json({ message: "Error fetching application", error });
    }
  },

  // Delete application
  deleteApplication: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const deletedApply = await Apply.findByIdAndDelete(id);
      if (!deletedApply) {
        res.status(404).json({ message: "Application not found" });
        return;
      }
      res.status(200).json({ message: "Application deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error deleting application", error });
    }
  },
};

export default ApplyController;
