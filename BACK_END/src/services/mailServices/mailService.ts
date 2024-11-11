import nodemailer from 'nodemailer';
import { htmlBaseLayout } from './layouts/basicLayout';

const SMTP_SERVER_USERNAME = process.env.SMTP_SERVER_USERNAME
const SMTP_SERVER_PASSWORD = process.env.SMTP_SERVER_PASSWORD

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587, // Hoặc 465 nếu dùng SSL
    secure: false, // True cho cổng 465, false cho cổng khác
    auth: {
        user: SMTP_SERVER_USERNAME,
        pass: SMTP_SERVER_PASSWORD,
    },
});

type MailTransfer = {
    sendTo?: string[];
    subject: string;
    html?: string;
    body?: string;
}

async function sendMail({
    sendTo,
    subject,
    html,
}: MailTransfer) {
    try {
        await transporter.verify();
        const info = await transporter.sendMail({
            from: "Recruit Me",
            to: sendTo,
            subject: subject,
            date: Date(),
            sender: "Recruit Me",
            html: html || '',
        });
        return info;
    } catch (error) {
        console.error('Something Went Wrong', SMTP_SERVER_USERNAME, SMTP_SERVER_PASSWORD, error);
        return;
    }
}

export const mailService = {
    sendMailBase: ({
        sendTo, subject, body
    }: MailTransfer) => {
        // Read the HTML file
        sendMail({
            subject: subject,
            sendTo: sendTo,
            html: htmlBaseLayout(body),
        })
    }
}