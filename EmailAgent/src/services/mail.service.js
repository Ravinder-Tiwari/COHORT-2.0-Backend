import fs from "fs";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail({ to, subject, html, text = "", attachments }) {
    try {
        const formattedAttachments = attachments?.map(att => ({
            filename: att.filename,
            content: fs.readFileSync(att.path), // ✅ FIX HERE
        })) || [];

        const response = await resend.emails.send({
            from: "onboarding@resend.dev",
            to,
            subject,
            html,
            text,
            attachments: formattedAttachments,
        });

        console.log("Email sent:", response);
        return "email sent successfully to " + to;

    } catch (error) {
        console.error("Email sending failed:", error);
        throw error;
    }
}



// import nodemailer from "nodemailer";

// const transporter = nodemailer.createTransport({
//     service: "gmail",
//     auth: {
//         type: 'OAuth2',
//         user: process.env.GOOGLE_USER,
//         clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//         refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
//         clientId: process.env.GOOGLE_CLIENT_ID
//     },
//     family: 4
// })

// transporter.verify()
//     .then(() => { console.log("Email transporter is ready to send emails"); })
//     .catch((err) => { console.error("Email transporter verification failed:", err); });

// export async function sendEmail({ to, subject, html, text = "", attachments }) {

//     const mailOptions = {
//         from: process.env.GOOGLE_USER,
//         to,
//         subject,
//         html,
//         text,
//         attachments: attachments || [],
//     };

//     const details = await transporter.sendMail(mailOptions);
//     console.log("Email sent:", details);
//     return "email sent successfully, to " + to;
// }
