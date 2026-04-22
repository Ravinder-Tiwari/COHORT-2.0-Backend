import dotenv from "dotenv";
import nodemailer from "nodemailer"


dotenv.config();


const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        type: "OAuth2",
        user: process.env.GOOGLE_USER,
        refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        clientId: process.env.GOOGLE_CLIENT_ID
    }
})


transporter.verify().then(() => {
    console.log("ready to use Email service")
})
    .catch((err) => {
        console.log("Email service is not ready", err)
    })


export async function sendEmail({ to, subject, html, text = "" }) {
    const mailOptions = {
        from: process.env.GOOGLE_USER,
        to,
        subject,
        html,
        text
    }

    const details = await transporter.sendMail(mailOptions);
    console.log("Email send Successfully:", details)
    return "Email sent successfully"
}