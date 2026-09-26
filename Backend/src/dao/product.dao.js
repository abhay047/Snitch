import productModel from "../models/product.model.js";

export const stockOfVariant = async (productId, variantId) => {
    if (!productId) return 0

    const product = await productModel.findById(productId)
    if (!product) return 0

    if (variantId && product.variants && product.variants.length > 0) {
        const variant = product.variants.find(
            (v) => v._id.toString() === variantId.toString()
        )
        if (variant) {
            return Number(variant.stock) || 0
        }
    }

    if (product.variants && product.variants.length > 0) {
        return Number(product.variants[0].stock) || 0
    }

    return 10
}