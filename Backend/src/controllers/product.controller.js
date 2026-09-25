import productModel from "../models/product.model.js"
import { uploadFile } from "../services/storage.service.js"

export async function createProduct(req, res) {
    const { title, description, priceAmount, priceCurrency, category, color, stock } = req.body
    const seller = req.user

    const images = await Promise.all(req.files.map(async (file) => {
        return await uploadFile({
            buffer: file.buffer,
            fileName: file.originalname
        })
    }))

    const initialVariants = []
    if (color && typeof color === "string" && color.trim()) {
        const trimmedColor = color.trim()
        initialVariants.push({
            images: images,
            stock: Math.max(0, Number(stock) >= 0 ? Number(stock) : 25),
            attributes: { color: trimmedColor },
            price: {
                amount: priceAmount,
                currency: priceCurrency || "INR"
            }
        })
    }

    const product = await productModel.create({
        title,
        description,
        category: category || "TSHIRTS",
        color: color ? color.trim() : "",
        price: {
            amount: priceAmount,
            currency: priceCurrency || "INR"
        },
        images,
        variants: initialVariants,
        seller: seller._id
    })

    res.status(201).json({
        message: "Product created successfully",
        success: true,
        product
    })
}

export async function getSellerProducts(req, res) {
    const seller = req.user

    const products = await productModel.find({ seller: seller._id })

    res.status(200).json({
        message: "Products fetched successfully",
        success: true,
        products
    })
}

export async function getAllProducts(req,res) {
    const products = await productModel.find()

    return res.status(200).json({
        message:"Products fetched successfully",
        success:true,
        products
    })
}

export async function getProductDetails(req,res) {
    const {id} = req.params

    const product = await productModel.findById(id)

    if(!product){
        return res.status(404).json({
            message:"Product not found",
            success:false
        })
    }

    return res.status(200).json({
        message:"Product details fetched successfully",
        success:true,
        product
    })
}

export async function createProductVariant(req, res) {
    try {
        const { id } = req.params
        let { stock, attributes, price, images } = req.body
        const seller = req.user

        const product = await productModel.findById(id)
        if (!product) {
            return res.status(404).json({ message: "Product not found", success: false })
        }

        if (product.seller.toString() !== seller._id.toString()) {
            return res.status(403).json({ message: "Unauthorized to modify this product", success: false })
        }

        if (typeof attributes === "string") {
            try { attributes = JSON.parse(attributes) } catch (e) { attributes = {} }
        }
        if (typeof price === "string") {
            try { price = JSON.parse(price) } catch (e) { price = {} }
        }

        let variantImages = []

        // Upload any files sent via multipart/form-data
        if (req.files && req.files.length > 0) {
            const uploaded = await Promise.all(req.files.map(async (file) => {
                const result = await uploadFile({
                    buffer: file.buffer,
                    fileName: file.originalname
                })
                return { url: result.url }
            }))
            variantImages = [...variantImages, ...uploaded]
        }

        // Also accept existing image URLs passed in body
        if (images) {
            let parsedImages = images
            if (typeof parsedImages === "string") {
                try { parsedImages = JSON.parse(parsedImages) } catch (e) { parsedImages = [parsedImages] }
            }
            if (Array.isArray(parsedImages)) {
                parsedImages.forEach((img) => {
                    if (typeof img === "string" && img.trim()) {
                        variantImages.push({ url: img.trim() })
                    } else if (img && img.url) {
                        variantImages.push({ url: img.url })
                    }
                })
            }
        }

        const newVariant = {
            stock: Math.max(0, Number(stock) || 0),
            attributes: attributes || {},
            price: {
                amount: price?.amount ? Number(price.amount) : product.price.amount,
                currency: price?.currency || product.price.currency || "INR"
            },
            images: variantImages
        }

        product.variants.push(newVariant)
        await product.save()

        return res.status(201).json({
            message: "Variant created successfully",
            success: true,
            product
        })
    } catch (err) {
        return res.status(500).json({
            message: err.message || "Failed to create variant",
            success: false
        })
    }
}

export async function addVariantImages(req, res) {
    try {
        const { id, variantId } = req.params
        const seller = req.user

        const product = await productModel.findById(id)
        if (!product) {
            return res.status(404).json({ message: "Product not found", success: false })
        }

        if (product.seller.toString() !== seller._id.toString()) {
            return res.status(403).json({ message: "Unauthorized to modify this product", success: false })
        }

        const variant = product.variants.id(variantId)
        if (!variant) {
            return res.status(404).json({ message: "Variant not found", success: false })
        }

        let newImages = []
        if (req.files && req.files.length > 0) {
            const uploaded = await Promise.all(req.files.map(async (file) => {
                const result = await uploadFile({
                    buffer: file.buffer,
                    fileName: file.originalname
                })
                return { url: result.url }
            }))
            newImages = [...newImages, ...uploaded]
        }

        let { imageUrls } = req.body
        if (imageUrls) {
            let parsed = imageUrls
            if (typeof parsed === "string") {
                try { parsed = JSON.parse(parsed) } catch (e) { parsed = [parsed] }
            }
            if (Array.isArray(parsed)) {
                parsed.forEach(img => {
                    if (typeof img === "string" && img.trim()) newImages.push({ url: img.trim() })
                    else if (img && img.url) newImages.push({ url: img.url })
                })
            }
        }

        if (newImages.length === 0) {
            return res.status(400).json({ message: "No images provided", success: false })
        }

        variant.images.push(...newImages)
        await product.save()

        return res.status(200).json({
            message: "Variant images added successfully",
            success: true,
            product
        })
    } catch (err) {
        return res.status(500).json({
            message: err.message || "Failed to add variant images",
            success: false
        })
    }
}

export async function updateVariantStock(req, res) {
    try {
        const { id, variantId } = req.params
        const { stock } = req.body
        const seller = req.user

        const product = await productModel.findById(id)
        if (!product) {
            return res.status(404).json({ message: "Product not found", success: false })
        }

        if (product.seller.toString() !== seller._id.toString()) {
            return res.status(403).json({ message: "Unauthorized to modify this product", success: false })
        }

        const variant = product.variants.id(variantId)
        if (!variant) {
            return res.status(404).json({ message: "Variant not found", success: false })
        }

        variant.stock = Math.max(0, Number(stock) || 0)
        await product.save()

        return res.status(200).json({
            message: "Stock updated successfully",
            success: true,
            product
        })
    } catch (err) {
        return res.status(500).json({
            message: err.message || "Failed to update stock",
            success: false
        })
    }
}

export async function deleteProductVariant(req, res) {
    try {
        const { id, variantId } = req.params
        const seller = req.user

        const product = await productModel.findById(id)
        if (!product) {
            return res.status(404).json({ message: "Product not found", success: false })
        }

        if (product.seller.toString() !== seller._id.toString()) {
            return res.status(403).json({ message: "Unauthorized to modify this product", success: false })
        }

        product.variants.pull({ _id: variantId })
        await product.save()

        return res.status(200).json({
            message: "Variant deleted successfully",
            success: true,
            product
        })
    } catch (err) {
        return res.status(500).json({
            message: err.message || "Failed to delete variant",
            success: false
        })
    }
}