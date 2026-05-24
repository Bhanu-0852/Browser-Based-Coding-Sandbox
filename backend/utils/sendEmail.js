// backend/utils/sendEmail.js
import dotenv from 'dotenv';

dotenv.config();

export const sendEmail = async (email, otp) => {
    try {
        // We use fetch to call Brevo's HTTP API, bypassing Render's SMTP block entirely!
        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'api-key': process.env.BREVO_API_KEY,
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                sender: {
                    name: "Secure Sandbox",
                    email: process.env.EMAIL_USER // This must be the email you used to sign up for Brevo
                },
                to: [{ email: email }], // The user's email from the login screen
                subject: 'Your Secure Sandbox OTP',
                htmlContent: `
                    <div style="font-family: Arial, sans-serif; max-width: 400px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; text-align: center;">
                        <h2 style="color: #3b82f6;">Secure Verification</h2>
                        <p>Your one-time password to complete registration is:</p>
                        <h1 style="font-size: 32px; letter-spacing: 5px; color: #1f2937;">${otp}</h1>
                        <p style="color: #6b7280; font-size: 12px;">This code will expire in 5 minutes.</p>
                    </div>
                `
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("❌ Brevo API Error:", errorData);
            throw new Error('Could not send OTP email');
        }

        console.log(`✅ OTP sent successfully to ${email} via HTTP API`);
    } catch (error) {
        console.error("❌ Email failed:", error);
        throw new Error('Could not send OTP email');
    }
};
