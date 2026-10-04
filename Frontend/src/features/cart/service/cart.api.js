import axios from "axios"

const cartApiInstance = axios.create({
    baseURL: "/api/cart",
    withCredentials: true
})

export const addItem = async ({ productId, variantId, quantity = 1 }) => {
    const url = variantId ? `/add/${productId}/${variantId}` : `/add/${productId}`
    const response = await cartApiInstance.post(url, {
        quantity: Math.max(1, Number(quantity) || 1)
    })
    return response.data
}

export const updateItemQuantity = async ({ itemId, quantity }) => {
    const response = await cartApiInstance.patch(`/item/${itemId}`, {
        quantity: Number(quantity)
    })
    return response.data
}

export const removeItem = async ({ itemId }) => {
    const response = await cartApiInstance.delete(`/item/${itemId}`)
    return response.data
}

export const clearCart = async () => {
    const response = await cartApiInstance.delete("/clear")
    return response.data
}

export const getCart = async () => {
    const response = await cartApiInstance.get("/")
    return response.data
}

export const createCartOrder = async (payload) => {
    const response = await cartApiInstance.post("/payment/create/order", payload || {})
    return response.data
}

export const verifyPayment = async (payload) => {
    const response = await cartApiInstance.post("/payment/verify", payload)
    return response.data
}

export const recordPaymentFailed = async (payload) => {
    const response = await cartApiInstance.post("/payment/failed", payload)
    return response.data
}

export const getOrderDetails = async (orderId) => {
    const response = await cartApiInstance.get(`/payment/order/${orderId}`)
    return response.data
}

export const getPaymentHistory = async () => {
    const response = await cartApiInstance.get("/payment/history")
    return response.data
}