import express from "express"
import { authenticateSeller } from "../middlewares/auth.middleware.js"
import { createProduct, getAllProducts, getProductDetails, getSellerProducts, createProductVariant, updateVariantStock, deleteProductVariant, addVariantImages } from "../controllers/product.controller.js"
import multer from "multer"
import { createProductValidator } from "../validator/product.validator.js"

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    }
})
const router = express.Router()

router.post("/", authenticateSeller, upload.array("images", 7), createProductValidator, createProduct)

router.get("/seller", authenticateSeller, getSellerProducts)

router.get("/", getAllProducts)

router.get("/detail:id", getProductDetails)
router.get("/detail/:id", getProductDetails)
router.get("/:id", getProductDetails)

router.post("/:id/variants", authenticateSeller, upload.array("images", 7), createProductVariant)

router.post("/:id/variants/:variantId/images", authenticateSeller, upload.array("images", 7), addVariantImages)

router.patch("/:id/variants/:variantId/stock", authenticateSeller, updateVariantStock)

router.delete("/:id/variants/:variantId", authenticateSeller, deleteProductVariant)

export default router