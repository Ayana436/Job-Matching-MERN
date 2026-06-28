import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendEmail = async ({ to, subject, html }) => {
    try {

        const info = await transporter.sendMail({
            from: `"AI Job Portal" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html
        });

        console.log("Email sent:", info.response);

        return true;

    } catch (err) {

        console.error("Email failed:");
        console.error(err);

        return false;
    }
};

export default sendEmail;