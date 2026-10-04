import mongoose from "mongoose";
import cartModel from "../models/cart.model.js";
import productModel from "../models/product.model.js";
import { stockOfVariant } from "../dao/product.dao.js";
import { createOrder, verifyPaymentSignature } from "../services/payment.service.js";
import paymentModel from "../models/payment.model.js";

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

        if (product.seller && product.seller.toString() === req.user._id.toString()) {
            return res.status(403).json({
                message: "You cannot add your own product to the bag",
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

export const createOrderController = async (req, res) => {
    try {
        let cart = await cartModel.findOne({ user: req.user._id }).populate("items.product");

        let subtotal = 0;
        let currency = req.body?.currency || "INR";
        const orderItems = [];

        if (cart && cart.items && cart.items.length > 0) {
            for (const item of cart.items) {
                let unitPrice = 0;
                let itemCurrency = currency;
                const product = item.product;
                const variantId = item.variant ? item.variant.toString() : null;
                let matchedVariant = null;

                if (variantId && product && Array.isArray(product.variants)) {
                    matchedVariant = product.variants.find(
                        (v) => v._id.toString() === variantId
                    );
                    if (matchedVariant?.price?.amount != null) {
                        unitPrice = Number(matchedVariant.price.amount);
                        if (matchedVariant.price.currency) itemCurrency = matchedVariant.price.currency;
                    }
                }

                if (!unitPrice && product?.price?.amount != null) {
                    unitPrice = Number(product.price.amount);
                    if (product.price.currency) itemCurrency = product.price.currency;
                }

                if (!unitPrice && item.price?.amount != null) {
                    unitPrice = Number(item.price.amount);
                    if (item.price.currency) itemCurrency = item.price.currency;
                }

                const qty = Math.max(1, Number(item.quantity) || 1);
                subtotal += unitPrice * qty;

                // Format images to [{ url: String }] matching paymentModel schema
                let itemImages = [];
                if (matchedVariant?.images && matchedVariant.images.length > 0) {
                    itemImages = matchedVariant.images.map((img) => ({
                        url: typeof img === "string" ? img : img.url || ""
                    }));
                } else if (product?.images && product.images.length > 0) {
                    itemImages = product.images.map((img) => ({
                        url: typeof img === "string" ? img : img.url || ""
                    }));
                }

                let itemSize = "";
                let itemColor = "";
                if (matchedVariant?.attributes) {
                    if (matchedVariant.attributes instanceof Map) {
                        itemSize = matchedVariant.attributes.get("size") || matchedVariant.attributes.get("Size") || "";
                        itemColor = matchedVariant.attributes.get("color") || matchedVariant.attributes.get("Color") || "";
                    } else if (typeof matchedVariant.attributes === "object") {
                        itemSize = matchedVariant.attributes.size || matchedVariant.attributes.Size || "";
                        itemColor = matchedVariant.attributes.color || matchedVariant.attributes.Color || "";
                    }
                }
                if (!itemColor && product?.color) {
                    itemColor = product.color;
                }

                orderItems.push({
                    title: product?.title || "Garment",
                    productId: product?._id || item.product,
                    variantId: item.variant || null,
                    quantity: qty,
                    images: itemImages,
                    description: product?.description || "",
                    size: itemSize,
                    color: itemColor,
                    price: {
                        amount: unitPrice,
                        currency: itemCurrency
                    }
                });
            }
        }

        let finalAmount = 0;
        if (subtotal > 0) {
            const gstAmount = Math.round(subtotal * 0.18);
            const handlingFee = Math.round(subtotal * 0.05);
            finalAmount = subtotal + gstAmount + handlingFee;
        } else if (req.body?.amount && Number(req.body.amount) > 0) {
            finalAmount = Math.round(Number(req.body.amount));
        }

        if (!finalAmount || finalAmount <= 0) {
            return res.status(400).json({
                message: "Shopping bag is empty or amount is invalid",
                success: false
            });
        }

        const order = await createOrder({ amount: finalAmount, currency });

        // Save initial payment record in database with "pending" status
        const payment = await paymentModel.create({
            user: req.user._id,
            status: "pending",
            price: {
                amount: finalAmount,
                currency: currency
            },
            razorpay: {
                orderId: order.id
            },
            orderItems: orderItems
        });

        return res.status(200).json({
            message: "Order created successfully",
            success: true,
            order,
            payment
        });
    } catch (error) {
        console.error("Error creating payment order:", error);
        return res.status(500).json({
            message: error.message || "Failed to create payment order",
            success: false
        });
    }
};

export const verifyPaymentController = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        if (!razorpay_order_id || !razorpay_payment_id) {
            return res.status(400).json({
                message: "Payment order ID and payment ID are required",
                success: false
            });
        }

        // Find existing payment document in database
        let payment = await paymentModel.findOne({
            "razorpay.orderId": razorpay_order_id,
            user: req.user._id
        });

        if (!payment) {
            payment = await paymentModel.findOne({
                "razorpay.orderId": razorpay_order_id
            });
        }

        if (!payment) {
            return res.status(404).json({
                message: "Payment record not found",
                success: false
            });
        }

        // Prevent double stock deduction if payment was already verified and processed
        if (payment.status === "paid") {
            return res.status(200).json({
                message: "Payment already verified and inventory already updated",
                success: true,
                payment
            });
        }

        if (razorpay_signature) {
            const isValid = verifyPaymentSignature({
                orderId: razorpay_order_id,
                paymentId: razorpay_payment_id,
                signature: razorpay_signature
            });

            if (!isValid) {
                payment.status = "failed";
                payment.razorpay.paymentId = razorpay_payment_id;
                payment.razorpay.signature = razorpay_signature;
                await payment.save();

                return res.status(400).json({
                    message: "Payment signature verification failed",
                    success: false
                });
            }
        }

        // Update payment record in database to "paid"
        payment.status = "paid";
        payment.razorpay.paymentId = razorpay_payment_id;
        payment.razorpay.signature = razorpay_signature || "";
        await payment.save();

        // Fetch user's cart
        let cart = await cartModel.findOne({ user: req.user._id });

        // Deduct purchased quantity from available stock for each product and variant
        const itemsToProcess = (Array.isArray(payment.orderItems) && payment.orderItems.length > 0)
            ? payment.orderItems
            : (cart && Array.isArray(cart.items) ? cart.items : []);

        for (const item of itemsToProcess) {
            const qtyToDeduct = Math.max(1, Number(item.quantity) || 1);
            const productId = item.productId || item.product;
            const variantId = item.variantId
                ? item.variantId.toString()
                : (item.variant ? item.variant.toString() : null);

            if (productId) {
                const product = await productModel.findById(productId);
                if (product) {
                    let variantDeducted = false;

                    // 1. Deduct from specific variant's stock if variantId is present
                    if (variantId && Array.isArray(product.variants) && product.variants.length > 0) {
                        const matchedVariant = product.variants.find(
                            (v) => v._id.toString() === variantId
                        );
                        if (matchedVariant) {
                            const currentVariantStock = Number(matchedVariant.stock) || 0;
                            matchedVariant.stock = Math.max(0, currentVariantStock - qtyToDeduct);
                            variantDeducted = true;
                        }
                    }

                    // 2. If no specific variant matched but product has variants, deduct from first/default variant
                    if (!variantDeducted && Array.isArray(product.variants) && product.variants.length > 0) {
                        const currentVariantStock = Number(product.variants[0].stock) || 0;
                        product.variants[0].stock = Math.max(0, currentVariantStock - qtyToDeduct);
                    }

                    // 3. Deduct from root product stock
                    if (product.stock != null) {
                        const currentProductStock = Number(product.stock) || 0;
                        product.stock = Math.max(0, currentProductStock - qtyToDeduct);
                    }

                    await product.save();
                }
            }
        }

        // Clear user's bag in database upon payment success
        if (cart) {
            cart.items = [];
            await cart.save();
        }

        return res.status(200).json({
            message: "Payment verified, inventory deducted, and recorded in database",
            success: true,
            payment
        });
    } catch (error) {
        console.error("Error verifying payment:", error);
        return res.status(500).json({
            message: error.message || "Failed to verify and record payment",
            success: false
        });
    }
};

export const paymentFailedController = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id } = req.body;

        if (razorpay_order_id) {
            const payment = await paymentModel.findOneAndUpdate(
                { "razorpay.orderId": razorpay_order_id, user: req.user._id },
                {
                    status: "failed",
                    "razorpay.paymentId": razorpay_payment_id || ""
                },
                { new: true }
            );

            return res.status(200).json({
                message: "Payment failure recorded in database",
                success: true,
                payment
            });
        }

        return res.status(400).json({
            message: "Order ID is required to record payment failure",
            success: false
        });
    } catch (error) {
        console.error("Error recording payment failure:", error);
        return res.status(500).json({
            message: error.message || "Failed to record payment failure",
            success: false
        });
    }
};

export const getUserPaymentsController = async (req, res) => {
    try {
        const payments = await paymentModel.find({ user: req.user._id }).sort({ createdAt: -1 });

        return res.status(200).json({
            message: "Payment records retrieved successfully",
            success: true,
            payments
        });
    } catch (error) {
        console.error("Error fetching user payments:", error);
        return res.status(500).json({
            message: error.message || "Failed to fetch user payments",
            success: false
        });
    }
};

export const getPaymentDetailsController = async (req, res) => {
    try {
        const { orderId } = req.params;
        const payment = await paymentModel.findOne({
            $or: [
                { "razorpay.orderId": orderId },
                { "razorpay.paymentId": orderId },
                ...(mongoose.Types.ObjectId.isValid(orderId) ? [{ _id: orderId }] : [])
            ],
            user: req.user._id
        });

        if (!payment) {
            return res.status(404).json({
                message: "Order details not found",
                success: false
            });
        }

        return res.status(200).json({
            message: "Order details retrieved successfully",
            success: true,
            payment
        });
    } catch (error) {
        console.error("Error retrieving order details:", error);
        return res.status(500).json({
            message: error.message || "Failed to retrieve order details",
            success: false
        });
    }
};