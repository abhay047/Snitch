import productModel from "../models/product.model.js"
import { uploadFile } from "../services/storage.service.js"
import cartModel from "../models/cart.model.js"

export async function createProduct(req, res) {
    const { title, description, priceAmount, priceCurrency, category, color, size, stock } = req.body
    const seller = req.user

    const images = await Promise.all(req.files.map(async (file) => {
        return await uploadFile({
            buffer: file.buffer,
            fileName: file.originalname
        })
    }))

    const initialVariants = []
    if ((color && typeof color === "string" && color.trim()) || (size && typeof size === "string" && size.trim())) {
        const trimmedColor = color && typeof color === "string" ? color.trim() : ""
        const trimmedSize = size && typeof size === "string" ? size.trim().toUpperCase() : ""
        const attrs = {}
        if (trimmedColor) attrs.color = trimmedColor
        if (trimmedSize) attrs.size = trimmedSize

        initialVariants.push({
            images: images,
            stock: Math.max(0, Number(stock) >= 0 ? Number(stock) : 25),
            attributes: attrs,
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

export async function updateProduct(req, res) {
    try {
        const { id } = req.params
        const seller = req.user
        const { title, description, category, color, priceAmount, priceCurrency, stock, existingImages } = req.body

        const product = await productModel.findById(id)
        if (!product) {
            return res.status(404).json({ message: "Product not found", success: false })
        }

        if (product.seller.toString() !== seller._id.toString()) {
            return res.status(403).json({ message: "Unauthorized to modify this product", success: false })
        }

        if (title !== undefined && title.trim()) product.title = title.trim()
        if (description !== undefined && description.trim()) product.description = description.trim()
        if (category !== undefined && category.trim()) product.category = category.trim().toUpperCase()
        if (color !== undefined) product.color = color.trim()
        if (priceAmount !== undefined && !isNaN(Number(priceAmount))) {
            product.price = {
                amount: Number(priceAmount),
                currency: priceCurrency || product.price?.currency || "INR"
            }
        }
        if (stock !== undefined && !isNaN(Number(stock))) {
            product.stock = Math.max(0, Number(stock))
        }

        // Handle Images: preserved existing images + newly uploaded files
        let finalImages = []

        if (existingImages !== undefined) {
            let parsedExisting = []
            try {
                if (typeof existingImages === "string") {
                    parsedExisting = JSON.parse(existingImages)
                } else if (Array.isArray(existingImages)) {
                    parsedExisting = existingImages
                }
            } catch {
                parsedExisting = Array.isArray(existingImages) ? existingImages : [existingImages]
            }

            if (Array.isArray(parsedExisting)) {
                parsedExisting.forEach((img) => {
                    if (typeof img === "string" && img.trim()) {
                        finalImages.push({ url: img.trim() })
                    } else if (img && img.url) {
                        finalImages.push({ url: img.url })
                    }
                })
            }
        } else if (!req.files || req.files.length === 0) {
            // Neither existingImages nor new files sent: keep current images
            finalImages = product.images || []
        } else {
            // New files sent without existingImages list: append to current images
            finalImages = [...(product.images || [])]
        }

        // Upload any new image files sent via Multer
        if (req.files && req.files.length > 0) {
            const uploaded = await Promise.all(
                req.files.map(async (file) => {
                    const result = await uploadFile({
                        buffer: file.buffer,
                        fileName: file.originalname
                    })
                    return { url: result.url }
                })
            )
            finalImages.push(...uploaded)
        }

        // If either existing images were specified or new files were uploaded, update product.images
        if (existingImages !== undefined || (req.files && req.files.length > 0)) {
            if (finalImages.length === 0) {
                return res.status(400).json({
                    message: "At least one product image is required",
                    success: false
                })
            }
            product.images = finalImages
        }

        await product.save()

        return res.status(200).json({
            message: "Drop updated successfully",
            success: true,
            product
        })
    } catch (err) {
        return res.status(500).json({
            message: err.message || "Failed to update product",
            success: false
        })
    }
}

export async function deleteProduct(req, res) {
    try {
        const { id } = req.params
        const seller = req.user

        const product = await productModel.findById(id)
        if (!product) {
            return res.status(404).json({ message: "Product not found", success: false })
        }

        if (product.seller.toString() !== seller._id.toString()) {
            return res.status(403).json({ message: "Unauthorized to delete this product", success: false })
        }

        await productModel.findByIdAndDelete(id)

        // Clean up references in shopping bags
        await cartModel.updateMany(
            { "items.product": id },
            { $pull: { items: { product: id } } }
        ).catch(() => {})

        return res.status(200).json({
            message: "Drop deleted successfully",
            success: true
        })
    } catch (err) {
        return res.status(500).json({
            message: err.message || "Failed to delete product",
            success: false
        })
    }
}