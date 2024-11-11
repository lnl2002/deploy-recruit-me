import express, { Router } from "express";
import ApplyController from "../controllers/ApplyController";
import { requireRole } from "../middlewares/auth";
import applyController from "../controllers/apply";

const applyRouter: Router = express.Router();

applyRouter.get("/", requireRole(['CANDIDATE']), ApplyController.getAllApplication);
applyRouter.get("/info/:jobId", requireRole(['CANDIDATE']), ApplyController.getApplicationInfoOfCandidate);
applyRouter.get("/cvs/:jobId", ApplyController.getAllCVsByJobId);
applyRouter.get("/:id", ApplyController.getApplicationById);
applyRouter.get("/interview-manager/applies",requireRole(["INTERVIEW_MANAGER"]), applyController.getApplyListByInterviewManager);
applyRouter.get("/statuses/all", ApplyController.getAllStatus)

applyRouter.post("/apply-job", requireRole(['CANDIDATE']), ApplyController.applyToJob);

applyRouter.put("/status/:id", ApplyController.changeStatus);

applyRouter.delete("/:id", ApplyController.deleteApplication);

export default applyRouter;
