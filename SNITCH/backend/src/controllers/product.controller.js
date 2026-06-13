import productModel from "../models/product.model.js";
import { uploadFile } from "../services/storage.service.js";

export const createProduct = async (req, res, next) => {
    try {
        const {
            title,
            description,
            priceAmount,
            priceCurrency = "INR"
        } = req.body;

        const seller = req.user;


        //Images get uploaded to storage and we get back the URLs
        const images = await Promise.all(req.files.map(async (file) => {
            return await uploadFile({
                buffer: file.buffer,
                fileName: file.originalname
            })
        }))

        console.log(images)
        const newProduct = await productModel.create({
            title: title.trim(),
            description: description.trim(),
            price: {
                amount: priceAmount,
                currency: priceCurrency ||  "INR"
            },
            seller: seller._id,
            images: images.map(img => ({
                url: img.url,
                alt: title
            }))
        })

        res.status(201).json({ message: "Product created successfully", product: newProduct })  

}
    catch (error) {
    res.status(500).json({ message: error.message })
}
}

export const getSellerProducts = async (req,res) =>{
    try{
        const seller = req.user;
        const products = await productModel.find({ seller: seller._id })

        return res.status(200).json({
            message:"products fetched successfully",
            products
        })
    }
    catch(err){
        return res.status(500).json({
            message:err.message
        })
    }

    
}


export const getAllProducts = async (req,res) =>{
    try{
        const products = await productModel.find()

        return res.status(200).json({
            message:"products fetched successfully",
            success:true,
            products
        })
    }
    catch(err){
        return res.status(500).json({
            message:err.message,
            success:false
        })
    }

    
}
