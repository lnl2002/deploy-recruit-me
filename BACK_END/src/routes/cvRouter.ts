import express, { Router } from "express";
import cvController from "../controllers/cvController";
import { validateCVInput } from "../middlewares/cvMiddleware";

const cvRouter: Router = express.Router();

cvRouter.get("/", cvController.getListCV);
cvRouter.post("/", validateCVInput, cvController.createCV);

export default cvRouter;
