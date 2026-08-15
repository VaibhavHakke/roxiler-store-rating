const authService = require("../services/authService");
const {
    validateRegisterData
} = require("../validators/authValidator");

const register = async (req, res) => {

    try {

        const {
            name,
            email,
            address,
            password
        } = req.body;

        const errors = validateRegisterData({
            name,
            email,
            address,
            password
        });

        if (Object.keys(errors).length > 0) {
            return res.status(400).json({
                success: false,
                errors
            });
        }

        const user = await authService.registerUser({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            address: address.trim(),
            password
        });

        return res.status(201).json({
            success: true,
            message: "Registration successful",
            user
        });

    } catch (error) {

        if (error.message === "Email is already registered") {
            return res.status(409).json({
                success: false,
                message: error.message
            });
        }

        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Something went wrong"
        });
    }
};

const login = async (req, res) => {

    try {

        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        const result = await authService.loginUser(
            email.trim().toLowerCase(),
            password
        );

        return res.status(200).json({
            success: true,
            message: "Login successful",
            ...result
        });

    } catch (error) {

        if (error.message === "Invalid email or password") {
            return res.status(401).json({
                success: false,
                message: error.message
            });
        }

        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Something went wrong"
        });
    }
};

module.exports = {
    register,
    login
};