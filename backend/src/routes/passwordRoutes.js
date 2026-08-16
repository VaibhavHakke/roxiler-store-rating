const express = require("express");

const {
    forgotPassword,
    verifyResetOTP,
    resetPassword
} = require("../controllers/passwordController");


const router =
    express.Router();


router.post(
    "/forgot-password",
    forgotPassword
);


router.post(
    "/verify-reset-otp",
    verifyResetOTP
);


router.post(
    "/reset-password",
    resetPassword
);


module.exports = router;