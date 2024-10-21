import { NextFunction, Request, Response } from "express";
import cvService from "../services/cvService";
import CV from "../models/cvModel";

const cvController = {
  getListCV: async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    try {
      const listCV = await cvService.getListCV();
      return res.json(listCV);
    } catch (error) {
      next(error);
    }
  },

  createCV: async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    try {
      // Validation is handled by the middleware
      // Extract validated data from the request body
      const {
        email,
        lastName,
        firstName,
        gender,
        phoneNumber,
        address,
        cv,
        url,
      } = req.body;

      // Create a new CV instance
      const newCV = new CV({
        email,
        lastName,
        firstName,
        gender,
        phoneNumber,
        address,
        cv,
        url,
      });

      // Save the CV
      const savedCV = await newCV.save();

      res.status(201).json({ message: "CV created successfully", cv: savedCV });
      return;
    } catch (error) {
      console.error(error);
      next(error);
      res.status(500).json({ message: "Error creating CV" });
    }
  },
};

export default cvController;
