import productModel from "../models/product.model.js";
import { uploadFile } from "../services/storage.service.js";


export const createProduct = async (req, res) => {
    try {
        const { title, description, priceAmount, priceCurrency } = req.body
        const seller = req.user;

        console.log(seller)

        //Images get uploaded to storage and we get back the URLs
        const images = await Promise.all(req.files.map(async (file) => {
            return await uploadFile({
                buffer: file.buffer,
                fileName: file.originalname
            })
        }))

        console.log(images)
        const newProduct = await productModel.create({
            title,
            description,
            price: {
                amount: priceAmount,
                currency: priceCurrency || "INR"
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


export const getSellerProducts = async (req, res) => {
    try {

        const seller = req.user

        if (!seller) {
            return res.status(404).json({ message: "Seller not found" })
        }

        const products = await productModel.find({ seller: seller._id })

        res.status(200).json({
            message: "Products fetched successfully",
            success: true,
            products
        })
    }
    catch (error) {
        res.status(500).json({ message: error.message })
    }
}