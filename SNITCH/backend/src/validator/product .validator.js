import {body, validationResult} from "express-validator";

function validateRequest(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
}



export const validateProductCreation = [
    body("title").notEmpty().withMessage("Title is required"),
    body("description").notEmpty().withMessage("Description is required"),
    body("priceAmount").notEmpty().withMessage("Price amount is required")
        .isNumeric().withMessage("Price amount must be a number"),
    body("priceCurrency").optional()
        .isIn(["USD", "INR", "EUR"]).withMessage("Price currency must be one of USD, INR, EUR"),
    validateRequest
]
