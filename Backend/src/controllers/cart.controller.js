import cartModel from "../models/cart.model.js";
import productModel from "../models/product.model.js";
import { stockOfVariant } from "../dao/product.dao.js";

export const addToCart = async (req, res) => {
    try {
        const productId = req.params.productId;
        const variantId = req.params.variantId || req.params.varientId || req.body.variantId || null;
        const quantity = Math.max(1, Number(req.body.quantity) || 1);

        const product = await productModel.findById(productId);
        if (!product) {
            return res.status(404).json({
                message: "Product not found",
                success: false
            });
        }

        let matchedVariant = null;
        if (variantId) {
            matchedVariant = product.variants?.find(
                (v) => v._id.toString() === variantId.toString()
            );
            if (!matchedVariant) {
                return res.status(404).json({
                    message: "Selected variant not found",
                    success: false
                });
            }
        }

        const stock = await stockOfVariant(productId, variantId);
        if (stock <= 0) {
            return res.status(400).json({
                message: "Selected garment is out of stock",
                success: false,
                availableStock: 0
            });
        }

        let cart = await cartModel.findOne({ user: req.user._id });
        if (!cart) {
            cart = await cartModel.create({ user: req.user._id, items: [] });
        }

        const existingItem = cart.items.find((item) => {
            const matchesProduct = item.product.toString() === productId.toString();
            const matchesVariant = variantId
                ? item.variant?.toString() === variantId.toString()
                : !item.variant;
            return matchesProduct && matchesVariant;
        });

        if (existingItem) {
            if (existingItem.quantity + quantity > stock) {
                return res.status(400).json({
                    message: `Only ${stock} unit${stock > 1 ? 's' : ''} available. You already have ${existingItem.quantity} in your bag.`,
                    success: false,
                    availableStock: stock
                });
            }

            existingItem.quantity += quantity;
            await cart.save();
            await cart.populate("items.product");

            return res.status(200).json({
                message: "Bag updated successfully",
                success: true,
                cart
            });
        }

        if (quantity > stock) {
            return res.status(400).json({
                message: `Only ${stock} unit${stock > 1 ? 's' : ''} available in stock`,
                success: false,
                availableStock: stock
            });
        }

        const itemPrice = matchedVariant?.price?.amount != null ? matchedVariant.price : product.price;

        cart.items.push({
            product: productId,
            variant: variantId || undefined,
            quantity,
            price: itemPrice
        });

        await cart.save();
        await cart.populate("items.product");

        return res.status(200).json({
            message: "Garment added to bag successfully",
            success: true,
            cart
        });
    } catch (error) {
        console.error("Error adding to cart:", error);
        return res.status(500).json({
            message: error.message || "Failed to add garment to bag",
            success: false
        });
    }
};

export const updateCartItemQuantity = async (req, res) => {
    try {
        const { itemId } = req.params;
        const quantity = Number(req.body.quantity);

        if (isNaN(quantity) || quantity < 0) {
            return res.status(400).json({
                message: "Quantity must be a non-negative number",
                success: false
            });
        }

        let cart = await cartModel.findOne({ user: req.user._id });
        if (!cart) {
            return res.status(404).json({
                message: "Cart not found",
                success: false
            });
        }

        const item = cart.items.find((i) => i._id.toString() === itemId);
        if (!item) {
            return res.status(404).json({
                message: "Item not found in bag",
                success: false
            });
        }

        if (quantity === 0) {
            cart.items = cart.items.filter((i) => i._id.toString() !== itemId);
            await cart.save();
            await cart.populate("items.product");
            return res.status(200).json({
                message: "Item removed from bag",
                success: true,
                cart
            });
        }

        const stock = await stockOfVariant(item.product, item.variant);
        if (quantity > stock) {
            return res.status(400).json({
                message: `Only ${stock} unit${stock > 1 ? 's' : ''} available in stock`,
                success: false,
                availableStock: stock
            });
        }

        item.quantity = quantity;
        await cart.save();
        await cart.populate("items.product");

        return res.status(200).json({
            message: "Quantity updated successfully",
            success: true,
            cart
        });
    } catch (error) {
        console.error("Error updating cart quantity:", error);
        return res.status(500).json({
            message: error.message || "Failed to update item quantity",
            success: false
        });
    }
};

export const removeCartItem = async (req, res) => {
    try {
        const { itemId } = req.params;

        let cart = await cartModel.findOne({ user: req.user._id });
        if (!cart) {
            return res.status(404).json({
                message: "Cart not found",
                success: false
            });
        }

        const initialLength = cart.items.length;
        cart.items = cart.items.filter((i) => i._id.toString() !== itemId);

        if (cart.items.length === initialLength) {
            return res.status(404).json({
                message: "Item not found in bag",
                success: false
            });
        }

        await cart.save();
        await cart.populate("items.product");

        return res.status(200).json({
            message: "Garment removed from bag",
            success: true,
            cart
        });
    } catch (error) {
        console.error("Error removing cart item:", error);
        return res.status(500).json({
            message: error.message || "Failed to remove item from bag",
            success: false
        });
    }
};

export const clearCart = async (req, res) => {
    try {
        let cart = await cartModel.findOne({ user: req.user._id });
        if (cart) {
            cart.items = [];
            await cart.save();
        }

        return res.status(200).json({
            message: "Bag emptied successfully",
            success: true,
            cart: cart || { items: [] }
        });
    } catch (error) {
        console.error("Error clearing cart:", error);
        return res.status(500).json({
            message: error.message || "Failed to empty bag",
            success: false
        });
    }
};

export const getCart = async (req, res) => {
    try {
        const user = req.user;

        let cart = await cartModel.findOne({ user: user._id }).populate("items.product");
        if (!cart) {
            cart = await cartModel.create({ user: user._id, items: [] });
        }

        return res.status(200).json({
            message: "Cart retrieved successfully",
            success: true,
            cart
        });
    } catch (error) {
        console.error("Error getting cart:", error);
        return res.status(500).json({
            message: error.message || "Failed to retrieve shopping bag",
            success: false
        });
    }
};