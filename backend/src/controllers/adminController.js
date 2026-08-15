const adminService = require("../services/adminService");

const {
    validateAdminUserData
} = require("../validators/authValidator");

const getDashboard = async (req, res) => {
    try {
        const dashboardData =
            await adminService.getDashboardData();

        return res.status(200).json({
            success: true,
            data: dashboardData
        });

    } catch (error) {

        console.error(
            "Admin dashboard error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to fetch dashboard data"
        });
    }
};

const createUser = async (req, res) => {

    try {

        const {
            name,
            email,
            password,
            address,
            role
        } = req.body;

        const errors = validateAdminUserData({
            name,
            email,
            address,
            password,
            role
        });

        if (Object.keys(errors).length > 0) {
            return res.status(400).json({
                success: false,
                errors
            });
        }

        const user =
            await adminService.createUser({
                name: name.trim(),
                email: email.trim().toLowerCase(),
                password,
                address: address.trim(),
                role
            });

        return res.status(201).json({
            success: true,
            message: "User created successfully",
            user
        });

    } catch (error) {

        if (error.message === "Email is already registered") {
            return res.status(409).json({
                success: false,
                message: error.message
            });
        }

        console.error(
            "Create user error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to create user"
        });
    }
};

module.exports = {
    getDashboard,
    createUser
};