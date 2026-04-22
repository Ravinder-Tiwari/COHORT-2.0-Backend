import {body, validationResult} from "express-validator"


const validateRequest = (req,res,next) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()})
    }
    next()
}


export const validateRegistration = [
    body("email").isEmail().withMessage("Invalid email format"),
    body("password").isLength({min:6}).withMessage("Password must be at least 6 characters long"),
    body("contact").notEmpty().withMessage("contact is required").matches(/^\d{10}$/).withMessage("Contact must be a valid 10-digit number"),
    body("fullname").notEmpty().withMessage("Full name is required"),
    body("isSeller").isBoolean().withMessage("isSeller must be a boolean value"),
    validateRequest
]

export const validateLogin = [
    body("email").isEmail().withMessage("Invalid email format"),
    body("password").isLength({min:6}).withMessage("Password must be at least 6 characters long"),
    validateRequest
]