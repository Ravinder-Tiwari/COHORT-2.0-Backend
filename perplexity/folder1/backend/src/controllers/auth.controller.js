import UserModel from "../models/user.model.js";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer"
import { sendEmail } from "../services/mail.service.js";



export async function registerUser(req, res, next) {
    try {
        const { username, email, password } = req.body;

        // Check if user already exists
        const existingUser = await UserModel.findOne({
            $or: [{ email }, { username }]
        });

        if (existingUser) {
            const err = new Error("User already exists");
            err.status = 400;
            return next(err);
        }

        // Create new user
        const user = await UserModel.create({
            username,
            email,
            password // Note: password should be hashed in the model
        });

        const emailVerificationToken = jwt.sign({
            email: user.email
        },
            process.env.JWT_SECRET
        )

        await sendEmail({
            to: email,
            subject: "Welcome to Perplexity",
            html: `<p>Hello ${username},</p>
            <p>Please verify your email by clicking the link below:</p>
            <a href="http://localhost:3000/api/auth/verify-email?token=${emailVerificationToken}">Verify Email</a>
            <p>Thank you for registering at Perplexity! We're excited to have you on board.</p> 
            <p>if you have any questions or need assistance, feel free to reach out to our support team.</p>
            <p>Best regards,The Perplexity TeamI</p>`
        })



        // Generate JWT token
        // const token = jwt.sign(
        //     { userId: user._id, email: user.email },
        //     process.env.JWT_SECRET || 'your-secret-key',
        //     { expiresIn: '7d' }
        // );

        // res.cookie('token', token) 
        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });

    } catch (error) {
        next(error)
    }
}

export async function verifyEmail(req, res, next) {
    try {
        const { token } = req.query;

        if (!token) {
            const err = new Error("Token required");
            err.status = 401;
            return next(err);
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await UserModel.findOne({ email: decoded.email });

        if (!user) {
            const err = new Error("Invalid token");
            err.status = 400;
            return next(err);
        }

        user.verified = true;
        await user.save();

        res.send(`
            <h1>Email verified successfully</h1>
            <p>You can now login to your account</p>
        `);

    } catch (error) {
        next(error);
    }
}

export async function loginUser(req, res, next) {
    try {
        const { email, password } = req.body;
        // Find user by email
        const user = await UserModel.findOne({ email });

        if (!user) {
            const err = new Error("Invalid credentials")
            err.status = 401
            return next(err)
        }

        /**
         * 
         */
        // Check password (assuming password is hashed)
        const isPasswordValid = await user.comparePassword(password);

        if (!isPasswordValid) {
            const err = new Error("Invalid credentials")
            err.status = 401
            return next(err)
        }

        if(!user.verified){
            const err = new Error("Please verify your email before logging in")
            err.status = 401
            return next(err)
        }
        // Generate JWT token
        const token = jwt.sign(
            { id: user._id, email: user.email },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '7d' }
        );
        res.cookie('token', token)

        res.json({
            success: true,
            message: 'Login successfully',
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });

    } catch (error) {
        next(error)
    }
}

export async function getMe(req,res,next){
    const userId = req.user.id
    const user = await UserModel.findById(userId).select("-password")

    if(!user){
        const err = new Error("user not found")
        err.status = 404
        return next(err)
    }
    res.status(200).json({
        message:"user details fetched successfully",
        user
    })
}
export async function logoutUser(req,res,next){
    res.clearCookie("token")
    res.json({
        success:true,
        message:"Logged out successfully"
    })
}