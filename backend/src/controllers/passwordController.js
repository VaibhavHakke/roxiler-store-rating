const bcrypt = require("bcryptjs");

const {
    findUserByEmail
} = require("../models/userModel");

const {
    createResetToken,
    findLatestValidToken,
    markTokenVerified,
    markTokenUsed,
    invalidateOldTokens
} = require("../models/passwordResetModel");

const {
    sendPasswordResetOTP
} = require("../config/mailer");

const db = require("../config/db");


/*
=========================================================
GENERATE 6 DIGIT OTP
=========================================================
*/

const generateOTP = () => {

    return Math.floor(
        100000 +
        Math.random() * 900000
    ).toString();
};


/*
=========================================================
FORGOT PASSWORD
=========================================================
*/

const forgotPassword = async (
    req,
    res
) => {

    try {

        const {
            email
        } = req.body;


        if (!email) {

            return res.status(400).json({
                message:
                    "Email is required."
            });
        }


        const user =
            await findUserByEmail(
                email
            );


        /*
        We intentionally return the same
        response whether the email exists
        or not.
        */

        if (!user) {

            return res.status(200).json({
                message:
                    "If the email is registered, a verification code has been sent."
            });
        }


        /*
        Invalidate previous OTPs
        */

        await invalidateOldTokens(
            user.id
        );


        /*
        Generate OTP
        */

        const otp =
            generateOTP();


        /*
        Hash OTP before storing it
        */

        const otpHash =
            await bcrypt.hash(
                otp,
                10
            );


        /*
        OTP expires after 10 minutes
        */

        const expiresAt =
            new Date(
                Date.now() +
                10 * 60 * 1000
            );


        await createResetToken({
            userId: user.id,
            otpHash,
            expiresAt
        });


        /*
        Send OTP
        */

        await sendPasswordResetOTP(
            user.email,
            otp
        );


        return res.status(200).json({
            message:
                "If the email is registered, a verification code has been sent."
        });

    } catch (error) {

        console.error(
            "Forgot password error:",
            error
        );

        return res.status(500).json({
            message:
                "Unable to process password reset request."
        });
    }
};


/*
=========================================================
VERIFY OTP
=========================================================
*/

const verifyResetOTP = async (
    req,
    res
) => {

    try {

        const {
            email,
            otp
        } = req.body;


        if (!email || !otp) {

            return res.status(400).json({
                message:
                    "Email and verification code are required."
            });
        }


        const user =
            await findUserByEmail(
                email
            );


        if (!user) {

            return res.status(400).json({
                message:
                    "Invalid verification request."
            });
        }


        const token =
            await findLatestValidToken(
                user.id
            );


        if (!token) {

            return res.status(400).json({
                message:
                    "Verification code is invalid or expired."
            });
        }


        const isValid =
            await bcrypt.compare(
                otp.toString(),
                token.otp_hash
            );


        if (!isValid) {

            return res.status(400).json({
                message:
                    "Invalid verification code."
            });
        }


        await markTokenVerified(
            token.id
        );


        return res.status(200).json({
            message:
                "Email verified successfully."
        });

    } catch (error) {

        console.error(
            "Verify OTP error:",
            error
        );

        return res.status(500).json({
            message:
                "Unable to verify verification code."
        });
    }
};


/*
=========================================================
RESET PASSWORD
=========================================================
*/

const resetPassword = async (
    req,
    res
) => {

    try {

        const {
            email,
            otp,
            newPassword
        } = req.body;


        if (
            !email ||
            !otp ||
            !newPassword
        ) {

            return res.status(400).json({
                message:
                    "Email, verification code and new password are required."
            });
        }


        /*
        Password validation
        */

        if (
            newPassword.length < 8 ||
            newPassword.length > 16
        ) {

            return res.status(400).json({
                message:
                    "Password must be 8-16 characters."
            });
        }


        if (
            !/[A-Z]/.test(
                newPassword
            )
        ) {

            return res.status(400).json({
                message:
                    "Password must contain at least one uppercase letter."
            });
        }


        if (
            !/[^A-Za-z0-9]/.test(
                newPassword
            )
        ) {

            return res.status(400).json({
                message:
                    "Password must contain at least one special character."
            });
        }


        const user =
            await findUserByEmail(
                email
            );


        if (!user) {

            return res.status(400).json({
                message:
                    "Invalid password reset request."
            });
        }


        const token =
            await findLatestValidToken(
                user.id
            );


        if (!token) {

            return res.status(400).json({
                message:
                    "Verification code is invalid or expired."
            });
        }


        /*
        Verify OTP again.

        This is intentional.

        We don't trust the frontend's
        step-3 state.
        */

        const validOTP =
            await bcrypt.compare(
                otp.toString(),
                token.otp_hash
            );


        if (!validOTP) {

            return res.status(400).json({
                message:
                    "Invalid verification code."
            });
        }


        /*
        Email must have been verified.
        */

        if (!token.verified_at) {

            return res.status(400).json({
                message:
                    "Please verify your email first."
            });
        }


        /*
        Hash new password
        */

        const hashedPassword =
            await bcrypt.hash(
                newPassword,
                10
            );


        /*
        Update password
        */

        await db.execute(
            `
            UPDATE users
            SET password = ?
            WHERE id = ?
            `,
            [
                hashedPassword,
                user.id
            ]
        );


        /*
        Make OTP unusable.
        */

        await markTokenUsed(
            token.id
        );


        return res.status(200).json({
            message:
                "Password changed successfully."
        });

    } catch (error) {

        console.error(
            "Reset password error:",
            error
        );

        return res.status(500).json({
            message:
                "Unable to reset password."
        });
    }
};


module.exports = {
    forgotPassword,
    verifyResetOTP,
    resetPassword
};