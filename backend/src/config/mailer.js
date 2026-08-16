const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: Number(process.env.MAIL_PORT || 587),

    secure: false,

    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASSWORD
    }
});

const sendPasswordResetOTP = async (email, otp) => {

    const mailOptions = {
        from: `"Store Rating System" <${process.env.MAIL_USER}>`,

        to: email,

        subject: "Store Rating - Password Reset Verification Code",

        text: `
Your Store Rating password reset verification code is:

${otp}

This code will expire in 10 minutes.

If you did not request a password reset, please ignore this email.
        `,

        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">

                <h2>Store Rating System</h2>

                <p>
                    We received a request to reset your password.
                </p>

                <p>
                    Your verification code is:
                </p>

                <div style="
                    font-size: 28px;
                    font-weight: bold;
                    letter-spacing: 6px;
                    margin: 20px 0;
                ">
                    ${otp}
                </div>

                <p>
                    This verification code will expire in
                    <strong>10 minutes</strong>.
                </p>

                <p>
                    If you did not request this password reset,
                    you can safely ignore this email.
                </p>

            </div>
        `
    };

    return transporter.sendMail(mailOptions);
};


module.exports = {
    sendPasswordResetOTP
};