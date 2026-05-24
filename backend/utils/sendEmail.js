// backend/utils/sendEmail.js
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config(); 

export const sendEmail = async (email, otp) => {
    try {
        // ✨ Force SMTP configuration with short timeouts to prevent Render hanging
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true, // Use SSL
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS, // Your 16-digit App Password
            },
            // ✨ THE FIX: Force it to timeout after 3 seconds instead of 2 minutes
            connectionTimeout: 3000,
            greetingTimeout: 3000,
            socketTimeout: 3000,
        });

        const mailOptions = {
            from: `"Secure Sandbox" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Your Secure Sandbox OTP',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 400px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; text-align: center;">
                    <h2 style="color: #3b82f6;">Secure Verification</h2>
                    <p>Your one-time password to complete registration is:</p>
                    <h1 style="font-size: 32px; letter-spacing: 5px; color: #1f2937;">${otp}</h1>
                    <p style="color: #6b7280; font-size: 12px;">This code will expire in 5 minutes.</p>
                </div>
            `,
        };

        await transporter.sendMail(mailOptions);
        console.log(`✅ OTP sent successfully to ${email}`);
    } catch (error) {
        console.error("❌ SMTP Email failed:", error);
        throw new Error('Could not send OTP email');
    }
};
