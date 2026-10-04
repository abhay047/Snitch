import Razorpay from "razorpay"
import { config } from "../config/config.js"
import crypto from "crypto"

const razorpay = new Razorpay({
    key_id: config.RAZORPAY_KEY_ID,
    key_secret: config.RAZORPAY_KEY_SECRET
})

export const createOrder = async({amount, currency = "INR"})=>{
    const options = {
        amount: amount * 100,
        currency
    }

    const order = await razorpay.orders.create(options)

    return order
}

export const verifyPaymentSignature = ({ orderId, paymentId, signature }) => {
    if (!orderId || !paymentId || !signature) return false;
    const generatedSignature = crypto
        .createHmac("sha256", config.RAZORPAY_KEY_SECRET)
        .update(`${orderId}|${paymentId}`)
        .digest("hex");
    return generatedSignature === signature;
}