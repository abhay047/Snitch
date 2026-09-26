import express from "express"
import { authenticateUser } from "../middlewares/auth.middleware.js"
import { validateAddToCart, validateUpdateQuantity, validateRemoveItem } from "../validator/cart.validator.js"
import { addToCart, getCart, updateCartItemQuantity, removeCartItem, clearCart } from "../controllers/cart.controller.js"

const router = express.Router()

router.post("/add/:productId/:variantId", authenticateUser, validateAddToCart, addToCart)
router.post("/add/:productId", authenticateUser, validateAddToCart, addToCart)
router.patch("/item/:itemId", authenticateUser, validateUpdateQuantity, updateCartItemQuantity)
router.delete("/item/:itemId", authenticateUser, validateRemoveItem, removeCartItem)
router.delete("/clear", authenticateUser, clearCart)
router.get("/", authenticateUser, getCart)

export default router