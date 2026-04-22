import dotenv from 'dotenv';
import nodemailer from "nodemailer"

dotenv.config();
const transporter = nodemailer.createTransport({
    service:"gmail",
    auth:{
        type:"OAuth2",
        user:process.env.GOOGLE_USER,
        refreshToken:process.env.GOOGLE_REFRESH_TOKEN,
        clientSecret:process.env.GOOGLE_CLIENT_SECRET,
        clientId:process.env.GOOGLE_CLIENT_ID
    }
})

// console.log(transporter)
transporter.verify().then(()=>{
    console.log("Email transporter is ready to send emails")
}).catch((err)=>{
    console.log(err)
    console.log("Email transporter verification failed")
})

export async function sendEmail({to,subject,html,text}){
    const mailOptions = {
        from:process.env.GOOGLE_USER,
        to,
        subject,
        html,
        text
    }

    const details = await transporter.sendMail(mailOptions);
    console.log("Email send Successfully:",details)
}