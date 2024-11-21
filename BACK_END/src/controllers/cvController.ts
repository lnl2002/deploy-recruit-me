import { NextFunction, Request, Response } from "express";
import cvService from "../services/cvService";
import CV from "../models/cvModel";
import fs from "fs";
import { s3 } from "../services/s3Service";
import crypto from "crypto";
import { Stream } from 'stream';

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

    //   // caculate cv score with job
    //   cvService.extractTextFromPdf(file.path, jobId);


      // Mã hóa file
      const key = Buffer.from(process.env.ENCRYPTION_KEY, "hex");
      const iv = Buffer.from(process.env.INITIALIZATION_KEY, "hex");
      const encryptedFilePath = await cvService.encryptFile(
        file.path,
        key,
        iv
      );
      console.log("Encryption Key (hex):", key.toString('hex'));
      console.log("IV (hex):", iv.toString('hex'));

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
        url: (s3Result as { Location: string }).Location,
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

  getCvFile: async (req: Request, res: Response, next: NextFunction) => {
    const cvId = req.params.cvId;

    try {
      const cv = await cvService.getCVById(cvId);
      const encryptedFileUrl = cv.url;

      const parsedUrl = new URL(encryptedFileUrl);
      const bucketName = parsedUrl.hostname.split(".")[0];
      const encryptedPath = parsedUrl.pathname.substring(1);

      const myKey = Buffer.from(process.env.ENCRYPTION_KEY, "hex");
      const myIV = Buffer.from(process.env.INITIALIZATION_KEY, "hex");
      // console.log("Encryption Key (hex):", myKey.toString('hex'));
      // console.log("IV (hex):", myIV.toString('hex'));

      const data = await s3
        .getObject({
          Bucket: bucketName,
          Key: encryptedPath,
        })
        .promise();

      // Create a ReadableStream regardless of data.Body type
      const fileStream = data.Body instanceof Buffer ?
        new Stream.PassThrough().end(data.Body) :
        data.Body as NodeJS.ReadableStream;

      if (!fileStream || typeof fileStream.pipe !== 'function') {
        throw new Error("Invalid data received from S3. Expected a Buffer or a ReadableStream.");
      }

      // Decrypt the file content
      const decipher = crypto.createDecipheriv("aes-256-cbc", myKey, myIV);
      const decryptedStream = fileStream.pipe(decipher);

      // Set headers for file download
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", "attachment; filename=decrypted-cv.pdf");

      // Pipe the decrypted data to the response
      decryptedStream.pipe(res);

    } catch (error) {
      console.error("Error downloading and decrypting CV:", error);
      res.status(500).json({ message: "Error downloading CV" });
      next(error);
    }
  },
};

export default cvController;
