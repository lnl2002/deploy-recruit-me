import express from "express";
import ApplyController from "../controllers/ApplyController";
import { requireRole } from "../middlewares/auth";

const applyRouter = express.Router();

applyRouter.get("/cvs/:jobId", ApplyController.getAllCVsByJobId);
applyRouter.get("/:id", ApplyController.getApplicationById);

applyRouter.post("/apply-job", requireRole(['CANDIDATE']) , ApplyController.applyToJob);

applyRouter.put("/status/:id", ApplyController.changeStatus);

applyRouter.delete("/:id", ApplyController.deleteApplication);

export default applyRouter;
