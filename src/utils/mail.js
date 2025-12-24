import nodemailer from "nodemailer";

export const sendEmail = async (options) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
    });
    await transporter.sendMail({
        from: '"Estate Admin" <noreply@estate.com>',
        to: options.email,
        subject: options.subject,
        text: options.message,
    });
};