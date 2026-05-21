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

        // ---------------- VALIDATIONS ----------------

        if (!title || !description || !priceAmount) {
            return res.status(400).json({
                success: false,
                message: "All required fields must be provided"
            });
        }

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: "At least one image is required"
            });
        }

        if (Number(priceAmount) <= 0) {
            return res.status(400).json({
                success: false,
                message: "Price must be greater than 0"
            });
        }

        // ---------------- IMAGE UPLOAD ----------------

        const uploadedImages = await Promise.all(
            req.files.map(async (file) => {

                // File validation
                const allowedMimeTypes = [
                    "image/jpeg",
                    "image/png",
                    "image/webp"
                ];

                if (!allowedMimeTypes.includes(file.mimetype)) {
                    throw new Error("Invalid image format");
                }

                // Max file size example (5MB)
                if (file.size > 5 * 1024 * 1024) {
                    throw new Error("Image size exceeds 5MB");
                }

                const uploaded = await uploadFile({
                    buffer: file.buffer,
                    fileName: file.originalname
                });

                return {
                    url: uploaded.url,
                    alt: title
                };
            })
        );

        // ---------------- CREATE PRODUCT ----------------

        const newProduct = await productModel.create({
            title: title.trim(),
            description: description.trim(),
            price: {
                amount: Number(priceAmount),
                currency: priceCurrency
            },
            seller: seller._id,
            images: uploadedImages
        });

        // ---------------- RESPONSE ----------------

        return res.status(201).json({
            success: true,
            message: "Product created successfully",
            product: newProduct
        });

    } catch (error) {

        console.error("Create Product Error:", error);

        return res.status(500).json({
            success: false,
            message: error.message || "Internal Server Error"
        });
    }
};
