import mongoose from "mongoose";


const productSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    seller:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"users",
        required:true
    },
    price:{
        amount:{
            type:Number,
            required:true
        },
        currency:{
            type:String,
            enum:["USD","INR","EUR"],
            default:"INR"
        }
    },
    images:[
        {
           url:{
                type:String,
                required:true
           },
           alt:{
                type:String,
                required:true
           }
        }
    ],
    
})


const productModel = mongoose.model("products", productSchema)

export default productModel;