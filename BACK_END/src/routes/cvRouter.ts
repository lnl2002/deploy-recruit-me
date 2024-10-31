import express, { Router } from "express";
import cvController from "../controllers/cvController";
import { upload, validateCVInput } from "../middlewares/cvMiddleware";

const cvRouter: Router = express.Router();

cvRouter.get("/", cvController.getListCV);
cvRouter.get("/:cvId/download", cvController.getCvFile); //TODO : require role Recruiter

cvRouter.post("/", upload.single("cv"), validateCVInput, cvController.createCV);

export default cvRouter;
