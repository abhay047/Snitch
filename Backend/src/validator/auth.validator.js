import { body, validationResult } from "express-validator";

function validateRequest(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
}

export const validateRegisterUser = [
    body("email").isEmail().withMessage("Invalid email format"),

    body("contact")
        .isMobilePhone()
        .withMessage("Invalid contact number")
        .matches(/^\d{10}$/)
        .withMessage("Contact number must be 10 digits"),

    body("password")
        .notEmpty()
        .withMessage("Password is required")
        .custom((value) => {
            if (value.length < 6) {
                throw new Error("Password should be at least 6 characters long");
            }
            const passwordRegex = /^(?=.*[A-Z])(?=.*\d).+$/;
            if (!passwordRegex.test(value)) {
                throw new Error(
                    "Password should contain at least one uppercase letter and a number",
                );
            }
            return true;
        }),
    body("password")
        .isLength({ max: 12 })
        .withMessage("Password should be less than 12 characters"),

    body("fullname")
        .notEmpty()
        .withMessage("Full name is required")
        .isLength({ min: 2 })
        .withMessage("Full name should be at least 2 characters long"),
    body("fullname")
        .isLength({ max: 50 })
        .withMessage("Full name should be less than 50 characters"),
    body("isSeller")
        .optional()
        .isBoolean()
        .withMessage("isSeller must be a boolean value"),

    validateRequest
];

export const validateLoginUser = [
    body("email").isEmail().withMessage("Invalid email format"),
    body("password").notEmpty().withMessage("Password is required"),
    validateRequest
];