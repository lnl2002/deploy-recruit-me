import { body, validationResult } from "express-validator";
import multer from "multer";
import path from "path";

export const validateCVInput = [
  body("email").isEmail().withMessage("Invalid email format").normalizeEmail(),

  body("firstName")
    .notEmpty()
    .withMessage("First name is required")
    .isString()
    .withMessage("First name must be a string")
    .trim()
    .isLength({ min: 2 })
    .withMessage("First name must be at least 2 characters long"),

  body("lastName")
    .notEmpty()
    .withMessage("Last name is required")
    .isString()
    .withMessage("Last name must be a string")
    .trim()
    .isLength({ min: 2 })
    .withMessage("Last name must be at least 2 characters long"),

  body("gender")
    .optional() // Gender is not required
    .isString()
    .withMessage("Gender must be a string")
    .isIn(["Male", "Female", "Others"])
    .withMessage("Invalid gender value"),

  body("dob")
    .optional()
    .isDate()
    .withMessage("Invalid date of birth format (YYYY-MM-DD)"),

  body("phoneNumber")
    .notEmpty()
    .withMessage("Phone number is required")
    .isMobilePhone("any")
    .withMessage("Invalid phone number format"),

  body("address")
    .optional() // Address is not required
    .isString()
    .withMessage("Address must be a string"),

  (req, res, next) => {
    const errors = validationResult(req);
    console.log(errors);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next(); // Proceed to the next middleware/controller
  },
];

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

export const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const fileTypes = /pdf/;
    const extname = fileTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = fileTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed!"));
    }
  },
});
