import { param, body, validationResult } from "express-validator"

const validateRequest = (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({
            message: errors.array()[0]?.msg || "Validation error",
            errors: errors.array(),
            success: false
        })
    }
    next()
}

export const validateAddToCart = [
    param("productId").isMongoId().withMessage("Invalid product ID"),
    param("variantId").optional().isMongoId().withMessage("Invalid variant ID"),
    body("quantity").optional().isInt({ min: 1 }).withMessage("Quantity must be at least 1"),
    validateRequest
]

export const validateUpdateQuantity = [
    param("itemId").isMongoId().withMessage("Invalid item ID"),
    body("quantity").isInt({ min: 0 }).withMessage("Quantity must be a non-negative integer"),
    validateRequest
]

export const validateRemoveItem = [
    param("itemId").isMongoId().withMessage("Invalid item ID"),
    validateRequest
]