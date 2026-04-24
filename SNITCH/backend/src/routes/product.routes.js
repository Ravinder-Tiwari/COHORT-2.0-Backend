import { Router } from "express";
import { authenticateSeller } from "../middlewares/auth.middleware.js";
import multer from "multer";
import { createProduct } from "../controllers/product.controller.js";
import { validateProductCreation } from "../validator/product .validator.js";


const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 } // Limit file size to 5MB

})
const productRouter = Router()

productRouter.post("/create",authenticateSeller,validateProductCreation,upload.array("images",7),createProduct)

export default productRouter