import nodemailer from "nodemailer";

const sendEmail = async ({
    to,
    subject,
    html
}) => {

    try {

        const transporter =
            nodemailer.createTransport({

                service: "gmail",

                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS
                }
            });

        await transporter.sendMail({
            from: `"AI Job Portal" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html
        });

        console.log("Email sent to:", to);

    } catch (err) {

        console.error(
            "Email send error:",
            err
        );
    }
};

export default sendEmail;