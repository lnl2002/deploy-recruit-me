import { NextFunction, Request, Response } from "express";
import cvService from "../services/cvService";
import CV from "../models/cvModel";
import fs from 'fs';

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
      const { email, lastName, firstName, gender, phoneNumber, address } =
        req.body;

      const { file } = req;

      // Mã hóa file
      const encryptedFilePath = await cvService.encryptFile(
        file.path,
        Buffer.from(process.env.ENCRYPTION_KEY, 'hex'),
        Buffer.from(process.env.INITIALIZATION_KEY, 'hex'),
      );
      
      // Upload file mã hóa lên S3
      const s3Result = await cvService.uploadEncryptedFileToS3(
        encryptedFilePath,
        process.env.S3_BUCKET_NAME
      );

      // Xóa file tạm sau khi upload
      fs.unlinkSync(file.path);
      fs.unlinkSync(encryptedFilePath);

      // Create a new CV instance
      const newCV = new CV({
        email,
        lastName,
        firstName,
        gender,
        phoneNumber,
        address,
        url:(s3Result as {Location: string}).Location, 
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
