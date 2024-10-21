import { body, param, validationResult } from "express-validator";
import CV from "../models/cvModel";
import Job from "../models/jobModel";

export const validateCreateApply = [
  // Validate cvId in the request body
  body("cvId").notEmpty().withMessage("CV ID is required"),

  // Validate jobId in the request body
  body("jobId").notEmpty().withMessage("Job ID is required"),

  // Check if CV and Job exist (you might move this to the controller if you prefer)
  param("cvId").custom(async (cvId) => {
    const cvExists = await CV.exists({ _id: cvId });
    if (!cvExists) {
      throw new Error("CV not found");
    }
  }),

  param("jobId").custom(async (jobId) => {
    const jobExists = await Job.exists({ _id: jobId });
    if (!jobExists) {
      throw new Error("Job not found");
    }
  }),

  // Middleware function to handle validation results
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];
