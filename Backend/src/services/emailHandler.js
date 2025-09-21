// utils/emailHandler.js
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.USER,
        pass: process.env.APP_PASSWORD,
        
    },
    
});
// console.log("USER:", process.env.USER);
// console.log("APP_PASSWORD:", process.env.APP_PASSWORD ? "****" : "MISSING");


export const sendResetLinkEmail = async (userEmail, resetLink) => {
    const mailOptions = {
        from: process.env.USER,
        to: userEmail,
        subject: "Password Reset Request",
        text: `You requested a password reset. Click the following link to reset your password:\n\n${resetLink}\n\nIf you did not request this, please ignore this email.`,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log("Reset link sent to email:", userEmail);
    } catch (error) {
        console.error("Error sending reset link email:", error);
        throw error;
    }
};

export const sendContactFormEmail = async (name, email, subject, message) => {
    const mailOptions = {
        from: process.env.USER, // Your Gmail sender
        to: "curelink45@gmail.com", // Where the contact form submissions will arrive
        subject: `New Contact Form Submission: ${subject}`,
        text: `You have received a new contact form submission:\n\nName: ${name}\nEmail: ${email}\nSubject: ${subject}\nMessage:\n${message}`,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log("Contact form message sent from:", email);
    } catch (error) {
        console.error("Error sending contact form email:", error);
        throw error;
    }
};
