import {createProduct, getSellerProduct, getAllProducts, getProductById, createVariant, updateVariantStock, deleteVariant, addVariantImages, updateProduct, deleteProduct} from "../services/product.api.js"
import {useDispatch} from "react-redux"
import {setSellerProducts, setProducts} from "../state/product.slice.js"

export const useProduct = ()=>{

    const dispatch = useDispatch()

    async function handleCreateProduct(formData) {
        const data = await createProduct(formData)
        return data.product
    }

    async function handleGetSellerProduct() {
        const data = await getSellerProduct()
        dispatch(setSellerProducts(data.products))
        return data.products
    }

    async function handleGetAllProducts() {
        const data = await getAllProducts()
        dispatch(setProducts(data.products))
    }

    async function handleGetProductById(productId) {
        const data = await getProductById(productId)
        return data.product
    }

    async function handleUpdateProduct(productId, updateData) {
        const data = await updateProduct(productId, updateData)
        return data.product
    }

    async function handleDeleteProduct(productId) {
        const data = await deleteProduct(productId)
        return data
    }

    async function handleCreateVariant(productId, variantData) {
        const data = await createVariant(productId, variantData)
        return data.product
    }

    async function handleUpdateVariantStock(productId, variantId, stock) {
        const data = await updateVariantStock(productId, variantId, stock)
        return data.product
    }

    async function handleDeleteVariant(productId, variantId) {
        const data = await deleteVariant(productId, variantId)
        return data.product
    }

    async function handleAddVariantImages(productId, variantId, formData) {
        const data = await addVariantImages(productId, variantId, formData)
        return data.product
    }

    return {
        handleCreateProduct,
        handleGetSellerProduct,
        handleGetAllProducts,
        handleGetProductById,
        handleUpdateProduct,
        handleDeleteProduct,
        handleCreateVariant,
        handleUpdateVariantStock,
        handleDeleteVariant,
        handleAddVariantImages
    }
}