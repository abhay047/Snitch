import { addItem, getCart, updateItemQuantity, removeItem, clearCart, createCartOrder, verifyPayment, recordPaymentFailed } from "../service/cart.api.js";
import { useDispatch } from "react-redux";
import { setItems } from "../state/cart.slice.js";

export const useCart = () => {
    const dispatch = useDispatch();

    async function handleAddItem({ productId, variantId, quantity = 1 }) {
        const data = await addItem({ productId, variantId, quantity });
        if (data?.cart?.items) {
            dispatch(setItems(data.cart.items));
        }
        return data;
    }

    async function handleGetCart() {
        const data = await getCart();
        if (data?.cart?.items) {
            dispatch(setItems(data.cart.items));
        }
        return data;
    }

    async function handleUpdateQuantity({ itemId, quantity }) {
        const data = await updateItemQuantity({ itemId, quantity });
        if (data?.cart?.items) {
            dispatch(setItems(data.cart.items));
        }
        return data;
    }

    async function handleRemoveItem({ itemId }) {
        const data = await removeItem({ itemId });
        if (data?.cart?.items) {
            dispatch(setItems(data.cart.items));
        }
        return data;
    }

    async function handleClearCart() {
        const data = await clearCart();
        if (data?.cart?.items) {
            dispatch(setItems(data.cart.items));
        } else {
            dispatch(setItems([]));
        }
        return data;
    }

    async function handleCreateCartOrder(payload) {
        const data = await createCartOrder(payload);
        return data.order;
    }

    async function handleVerifyPayment(payload) {
        const data = await verifyPayment(payload);
        return data;
    }

    async function handleRecordPaymentFailed(payload) {
        const data = await recordPaymentFailed(payload);
        return data;
    }

    return {
        handleAddItem,
        handleGetCart,
        handleUpdateQuantity,
        handleRemoveItem,
        handleClearCart,
        handleCreateCartOrder,
        handleVerifyPayment,
        handleRecordPaymentFailed
    };
};