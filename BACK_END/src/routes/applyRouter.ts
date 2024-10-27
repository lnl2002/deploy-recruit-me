import express, { Router } from "express";
import ApplyController from "../controllers/ApplyController";

const applyRouter: Router = express.Router();

applyRouter.get("/cvs/:jobId", ApplyController.getAllCVsByJobId);
applyRouter.get("/:id", ApplyController.getApplicationById);

applyRouter.post("/apply-job", ApplyController.applyToJob);

applyRouter.put("/status/:id", ApplyController.changeStatus);

applyRouter.delete("/:id", ApplyController.deleteApplication);

export default applyRouter;
