import CV, { ICV } from "../models/cvModel";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { s3 } from "./s3Service";

const cvService = {
  getListCV: async (): Promise<ICV[] | []> => {
    const listCV = await CV.find({});
    return listCV;
  },

  /**
 * Encrypts a file using AES-256-CBC.
 *
 * @param {string} filePath - The path to the file to encrypt.
 * @param {Buffer} key - The encryption key (must be 32 bytes long for AES-256).
 * @param {Buffer} iv - The initialization vector (must be 16 bytes long for AES-CBC).
 * @returns {Promise<string>} - A promise that resolves with the path to the encrypted file.
 */

  encryptFile: (filePath: string, key: Buffer, iv: Buffer): Promise<string> => {
    // Always validate your inputs:
    if (!Buffer.isBuffer(key) || key.length !== 32) {
      throw new Error("Encryption key must be a 32-byte Buffer.");
    }
    if (!Buffer.isBuffer(iv) || iv.length !== 16) {
      throw new Error("Initialization vector (IV) must be a 16-byte Buffer.");
    }

    const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
    const input = fs.createReadStream(filePath);
    const encryptedPath = path.join(
      __dirname,
      "encrypted_cv",
      `${Date.now()}_encrypted_cv`
    );
    const output = fs.createWriteStream(encryptedPath);

    // Important: Handle potential errors during encryption
    input.on("error", (err) => {
      console.error("Error reading input file:", err);
      // Handle the error appropriately, e.g., reject a promise
    });

    cipher.on("error", (err) => {
      console.error("Error during encryption:", err);
      // Handle the error
    });

    return new Promise((resolve, reject) => {
      input.pipe(cipher).pipe(output);
      output.on("finish", () => resolve(encryptedPath));
      output.on("error", reject);
    });
  },

  // --- Decryption ---
  decryptFile: (encryptedPath: string, key: Buffer, iv: Buffer, outputPath: string): Promise<string> => {
    // Input validation (similar to encryption)
    if (!Buffer.isBuffer(key) || key.length !== 32) {
      throw new Error("Decryption key must be a 32-byte Buffer.");
    }
    if (!Buffer.isBuffer(iv) || iv.length !== 16) {
      throw new Error("Initialization vector (IV) must be a 16-byte Buffer.");
    }

    const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
    const input = fs.createReadStream(encryptedPath);
    const output = fs.createWriteStream(outputPath);

    // Error handling during decryption
    input.on("error", (err) => {
      console.error("Error reading encrypted file:", err);
    });

    decipher.on("error", (err) => {
      console.error("Error during decryption:", err);
    });

    return new Promise((resolve, reject) => {
      input.pipe(decipher).pipe(output);
      output.on("finish", () => resolve(outputPath));
      output.on("error", reject);
    });
  },

  // --- S3 Upload ---
  uploadEncryptedFileToS3: async (filePath: string, bucketName: string): Promise<object> => {
    const fileStream = fs.createReadStream(filePath);
    const uploadParams = {
      Bucket: bucketName,
      Key: path.basename(filePath),
      Body: fileStream,
    };

    try {
      const result = await s3.upload(uploadParams).promise();
      return result;
    } catch (err) {
      console.error("Error uploading to S3:", err);
      throw err; // Re-throw to handle the error at a higher level
    }
  },
};

export default cvService;
