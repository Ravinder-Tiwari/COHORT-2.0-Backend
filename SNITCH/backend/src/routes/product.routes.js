import { Router } from "express";
import { authenticateSeller } from "../middlewares/auth.middleware.js";
import multer from "multer";
import { createProduct , getSellerProducts, getAllProducts} from "../controllers/product.controller.js";
import { validateProductCreation } from "../validator/product .validator.js";


const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 } // Limit file size to 5MB

})
const productRouter = Router()


/**
 * - POST /api/products/create
 */  
productRouter.post("/create",authenticateSeller,upload.array("images",7),validateProductCreation,createProduct)


/**
 * - GET /api/products/seller
 * - Get all products of the authenticated seller
 */

productRouter.get("/seller", authenticateSeller, getSellerProducts)


/**
 * @rou
 * GET /api/products
 * @public access
 */

productRouter.get("/",getAllProducts) 


export default productRouter