import axios from "axios"


const authApiInstance = axios.create({
    baseURL:"/api/auth",
    withCredentials:true,
})


export async function register({fullname,email,password,contact,isSeller = false}){
    try{
        const response = await authApiInstance.post("/register",{
        fullname,
        email,
        password,
        contact,
        isSeller
    })
    console.log(response)
    return response.data
    }
    catch(err){
        console.log(err.response?.data)
        throw err
    }
}

export async function login({email,password}){
    try{
        const response = await authApiInstance.post("/login",{
        email,
        password,
    })
    console.log(response)
    return response.data
    }
    catch(err){
        console.log(err.response?.data)
        throw err
    }   
}