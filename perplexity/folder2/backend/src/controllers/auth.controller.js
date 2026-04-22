import userModel from "../models/user.model.js";
import { sendEmail } from "../services/mail.service.js";
import jwt from "jsonwebtoken";

export async function registerUser(req, res, next) {

    try {
        const { username, email, password } = req.body;

        // Check if user already exists
        const existingUser = await userModel.findOne({
            $or: [{ email }, { username }]
        });

        if (existingUser) {
            const err = new Error("User already exists");
            err.status = 409; // Conflict
            return next(err);
        }

        // Create new user
        const user = await userModel.create({
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
            const err = new Error("Verification token is missing");
            err.status = 400;
            return next(err);
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await userModel.findOne({ email: decoded.email });

        user.verified = true;
        user.save();
        res.send(`
<div style="margin:0; padding:0; font-family:Arial, sans-serif; background:#f4f6f8; display:flex; justify-content:center; align-items:center; height:100vh;">

    <div style="background:#fff; padding:35px; border-radius:10px; box-shadow:0 6px 15px rgba(0,0,0,0.1); text-align:center; width:350px;">
        
        <div style="font-size:50px; color:#28a745; margin-bottom:15px;">✔</div>
        
        <h2 style="margin:0; color:#333;">Email Verified</h2>
        
        <p style="color:#666; font-size:14px; margin:10px 0 20px;">
            Your email has been successfully verified.
        </p>
        
        <a href="http://localhost:5173/login"
           style="display:inline-block; padding:10px 20px; background:#28a745; color:#fff; text-decoration:none; border-radius:5px; font-size:14px;">
           Continue
        </a>

    </div>

</div>
`);
    } catch (error) {
        next(error)
    }

}

export async function loginUser(req, res, next) {
    try {
        const { email, password } = req.body
        const user = await userModel.findOne({ email })

        if (!user) {
            const err = new Error('Invalid credentials')
            err.status = 401
            return next(err)
        }

        if (!user.verified) {
            const err = new Error('Please verify your email before logging in')
            err.status = 401
            return next(err)
        }
        const token = jwt.sign({
            id: user._id,
            username: user.username,
            email: user.email
        },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        )
        res.cookie('token', token)

        res.json({
            success: true,
            message: 'Login successful',
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        })

    } catch (err) {
        next(err)
    }
}

export async function resendVerificationEmail(req, res, next) {

    try {
        const { email } = req.body
        const user = await userModel.findOne({ email })

        if (!user) {
            const err = new Error('User not found')
            err.status = 404
            return next(err)
        }
        if (user.verified) {
            const err = new Error('Email is already verified')
            err.status = 400
            return next(err)
        }
        const emailVerificationToken = jwt.sign({
            email: user.email

        },
            process.env.JWT_SECRET
        )
        await sendEmail({
            to: email,
            subject: "Email Verification - Perplexity",
            html: `<p>Hello ${user.username},</p>   
            <p>It seems like you requested to resend the email verification link. Please click the link below to verify your email address:</p>
            <a href="http://localhost:3000/api/auth/verify-email?token=${emailVerificationToken}">Verify Email</a>
            <p>If you did not request this, please ignore this email.</p>
            <p>Best regards,</p>
            <p>The Perplexity Team</p>`
        })

        res.json({
            success: true,
            message: 'Verification email resent successfully'
        })
    } catch (err) {
        next(err)
    }
}