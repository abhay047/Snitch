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

    const trimmedColor = color && typeof color === "string" ? color.trim() : ""
    const trimmedSize = size && typeof size === "string" ? size.trim().toUpperCase() : "M"
    const attrs = {}
    if (trimmedColor) attrs.color = trimmedColor
    if (trimmedSize) attrs.size = trimmedSize

    const initialStock = Math.max(0, !isNaN(Number(stock)) ? Number(stock) : 25)

    const initialVariants = [
        {
            images: images,
            stock: initialStock,
            attributes: attrs,
            price: {
                amount: Number(priceAmount),
                currency: priceCurrency || "INR"
            }
        }
    ]

    const product = await productModel.create({
        title,
        description,
        category: category || "TSHIRTS",
        color: trimmedColor,
        price: {
            amount: Number(priceAmount),
            currency: priceCurrency || "INR"
        },
        stock: initialStock,
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

    const product = await productModel.findById(id).populate("seller", "fullname email role")

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

        // If default variant (variants[0]), sync root product images as well
        const isDefaultVariant = product.variants.length > 0 && product.variants[0]._id.toString() === variantId.toString()
        if (isDefaultVariant) {
            product.images.push(...newImages)
        }

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

        // If default variant (variants[0]), sync root product stock
        const isDefaultVariant = product.variants.length > 0 && product.variants[0]._id.toString() === variantId.toString()
        if (isDefaultVariant) {
            product.stock = variant.stock
        }

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

export async function updateProductVariant(req, res) {
    try {
        const { id, variantId } = req.params
        const seller = req.user
        let { stock, attributes, price, existingImages, images } = req.body

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

        // Determine if this variant is the default variant (the very first variant of the product)
        const isDefaultVariant = product.variants.length > 0 && product.variants[0]._id.toString() === variantId.toString()

        // 1. Update Stock
        if (stock !== undefined && !isNaN(Number(stock))) {
            variant.stock = Math.max(0, Number(stock))
            if (isDefaultVariant) {
                product.stock = variant.stock
            }
        }

        // 2. Update Attributes
        let cleanAttrs = null
        if (attributes !== undefined) {
            let parsedAttributes = attributes
            if (typeof parsedAttributes === "string") {
                try {
                    parsedAttributes = JSON.parse(parsedAttributes)
                } catch {
                    parsedAttributes = {}
                }
            }
            if (parsedAttributes && typeof parsedAttributes === "object") {
                cleanAttrs = {}
                for (const [k, v] of Object.entries(parsedAttributes)) {
                    if (k && k.trim() && v !== undefined && v !== null && String(v).trim()) {
                        cleanAttrs[k.trim().toLowerCase()] = String(v).trim()
                    }
                }
                variant.set("attributes", cleanAttrs)

                // If default variant, synchronize color with root product if color attribute is present
                if (isDefaultVariant) {
                    const colorVal = cleanAttrs.color || cleanAttrs.colour
                    if (colorVal) {
                        product.color = colorVal
                    }
                }
            }
        }

        // 3. Update Price
        if (price !== undefined) {
            let parsedPrice = price
            if (typeof parsedPrice === "string") {
                try {
                    parsedPrice = JSON.parse(parsedPrice)
                } catch {
                    parsedPrice = {}
                }
            }
            const amount = parsedPrice?.amount !== undefined ? Number(parsedPrice.amount) : variant.price?.amount || product.price.amount
            const currency = parsedPrice?.currency || variant.price?.currency || product.price?.currency || "INR"
            variant.price = {
                amount: !isNaN(amount) && amount >= 0 ? amount : product.price.amount,
                currency
            }
            // If default variant, synchronize price with root product
            if (isDefaultVariant) {
                product.price = {
                    amount: variant.price.amount,
                    currency: variant.price.currency
                }
            }
        }

        // 4. Update Images: preserve existing images + upload any new files via Multer
        let finalImages = []
        const rawExisting = existingImages !== undefined ? existingImages : images

        if (rawExisting !== undefined) {
            let parsedExisting = []
            try {
                if (typeof rawExisting === "string") {
                    parsedExisting = JSON.parse(rawExisting)
                } else if (Array.isArray(rawExisting)) {
                    parsedExisting = rawExisting
                }
            } catch {
                parsedExisting = Array.isArray(rawExisting) ? rawExisting : [rawExisting]
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
            finalImages = variant.images || []
        } else {
            finalImages = [...(variant.images || [])]
        }

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

        if (rawExisting !== undefined || (req.files && req.files.length > 0)) {
            variant.images = finalImages
            // If default variant, synchronize images with root product
            if (isDefaultVariant && finalImages.length > 0) {
                product.images = finalImages
            }
        }

        await product.save()

        return res.status(200).json({
            message: "Variant updated successfully",
            success: true,
            product
        })
    } catch (err) {
        return res.status(500).json({
            message: err.message || "Failed to update variant",
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

        const isDeletingDefault = product.variants.length > 0 && product.variants[0]._id.toString() === variantId.toString()

        product.variants.pull({ _id: variantId })

        // If the default variant was removed and others remain, sync the new first variant with product
        if (isDeletingDefault && product.variants.length > 0) {
            const newDefault = product.variants[0]
            if (newDefault.price) {
                product.price = {
                    amount: newDefault.price.amount,
                    currency: newDefault.price.currency
                }
            }
            if (newDefault.stock != null) {
                product.stock = newDefault.stock
            }
            if (newDefault.images && newDefault.images.length > 0) {
                product.images = newDefault.images
            }
            const attrs = newDefault.attributes ? (newDefault.attributes instanceof Map ? Object.fromEntries(newDefault.attributes) : { ...newDefault.attributes }) : {}
            const colorVal = attrs.color || attrs.colour
            if (colorVal) {
                product.color = colorVal
            }
        }

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

        // Two-way synchronization: Keep default variant (variants[0]) updated with root drop specifications
        if (product.variants && product.variants.length > 0) {
            const defaultVariant = product.variants[0]
            if (priceAmount !== undefined && !isNaN(Number(priceAmount))) {
                defaultVariant.price = {
                    amount: Number(priceAmount),
                    currency: priceCurrency || product.price?.currency || "INR"
                }
            }
            if (stock !== undefined && !isNaN(Number(stock))) {
                defaultVariant.stock = Math.max(0, Number(stock))
            }
            if (color !== undefined && color.trim()) {
                const attrs = defaultVariant.attributes ? (defaultVariant.attributes instanceof Map ? Object.fromEntries(defaultVariant.attributes) : { ...defaultVariant.attributes }) : {}
                attrs.color = color.trim()
                defaultVariant.set("attributes", attrs)
            }
            if (existingImages !== undefined || (req.files && req.files.length > 0)) {
                if (finalImages.length > 0) {
                    defaultVariant.images = finalImages
                }
            }
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