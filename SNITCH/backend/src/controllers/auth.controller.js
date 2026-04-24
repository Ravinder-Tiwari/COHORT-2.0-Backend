import userModel from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { config } from "../config/config.js";

async function sendTokenResponse(user, res, message) {

    const token = jwt.sign({
        id: user._id
    }, config.JWT_SECRET, {
        expiresIn: "7d"
    })

    res.cookie("token", token)

    res.status(201).json({
        message,
        token,
        user: {
            id: user._id,
            email: user.email,
            contact: user.contact,
            fullname: user.fullname,
            role: user.role
        }
    })

}


export const registerUser = async (req, res) => {
    try {

        const { email, password, contact, fullname, role, isSeller } = req.body

        const existingUser = await userModel.findOne({
            $or: [
                { email },
                { contact }
            ]
        })

        if (existingUser) {
            return res.status( 400).json({ message: "User already exists" })
        }


        const newUser = await userModel.create  ({
            email,
            password,
            contact,
            fullname,
            role:isSeller ? "seller" : "buyer"
        })

        await sendTokenResponse(newUser, res, "User registered successfully")

        return

    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body
        const user = await userModel.findOne({ email })
        console.log(user)
        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" })
        }

        const isMatch = await user.comparePassword(password)
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" })
        }
        
        await sendTokenResponse(user, res, "User logged in successfully")
        return
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

export const googleCallback = async(req,res)=>{
    // console.log(req.user)
    const {id,displayName,emails,photos} = req.user

    let email = emails[0].value
    let user = await userModel.findOne(
        { email }
    )

    if(!user){
        user = await userModel.create({
            email,
            fullname:displayName,
            googleId:id,
            role:"buyer"
        })
    }

    const token = jwt.sign({
        id: user._id
    }, config.JWT_SECRET, {
        expiresIn: "7d"
    })
    
    res.cookie("token", token)

    res.redirect("http://localhost:5173/")
}