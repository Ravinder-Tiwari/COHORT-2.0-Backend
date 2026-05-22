import { createProduct, getSellerProducts } from "../services/product.api"
import { useDispatch } from "react-redux"
import { setSellerProducts } from "../state/product.slice"

/**
 * Create functions
 *  - handleCreateProduct
 *  - handleGetSellerProduct
 */

export const useProduct = () => {

    const dispatch =  useDispatch()
    async function handleCreateProduct(formData) {
        const data = await createProduct(formData)
        return data.product
    }

    async function handleGetSellerProduct() {
        const data = await getSellerProducts()
        dispatch(data.products)
    }
    

    return {
        handleCreateProduct,
        handleGetSellerProduct
    }
}