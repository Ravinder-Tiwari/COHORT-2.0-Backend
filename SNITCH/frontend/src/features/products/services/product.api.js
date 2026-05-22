import axios from "axios";

const productApi = axios.create({
    baseURL:"/api/products",
    withCredentials:true
})


//function for creating a product
export async function createProduct(formData){
    const response = await productApi.post("/create",formData,{
        headers:{
            "Content-Type":"multipart/form-data"
        }
    })
    return response.data;

}


//function for getting all products of the authenticated seller

export async function getSellerProducts(){

    const response = await productApi.get("/seller")

    return response.data;
}