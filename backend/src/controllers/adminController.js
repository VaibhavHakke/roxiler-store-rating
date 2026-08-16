const adminService =
    require("../services/adminService");

const {
    validateAdminUserData
} = require("../validators/authValidator");

const {
    validateCreateStoreData
} = require("../validators/storeValidator");

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
            message:
                "Failed to fetch dashboard data"
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

        const errors =
            validateAdminUserData({
                name,
                email,
                address,
                password,
                role
            });

        if (
            Object.keys(errors).length > 0
        ) {
            return res.status(400).json({
                success: false,
                errors
            });
        }

        const user =
            await adminService.createUser({
                name: name.trim(),
                email: email
                    .trim()
                    .toLowerCase(),
                password,
                address: address.trim(),
                role
            });

        return res.status(201).json({
            success: true,
            message:
                "User created successfully",
            user
        });

    } catch (error) {

        if (
            error.message ===
            "Email is already registered"
        ) {
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
            message:
                "Failed to create user"
        });
    }
};

const getUsers = async (req, res) => {

    try {

        const {
            search,
            role,
            sortBy,
            order
        } = req.query;

        if (
            role &&
            ![
                "USER",
                "ADMIN",
                "STORE_OWNER"
            ].includes(role)
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid role. Allowed roles are USER, ADMIN and STORE_OWNER"
            });
        }

        const allowedSortColumns = [
            "name",
            "email",
            "address",
            "role",
            "createdAt"
        ];

        if (
            sortBy &&
            !allowedSortColumns.includes(
                sortBy
            )
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid sort field"
            });
        }

        if (
            order &&
            ![
                "asc",
                "desc"
            ].includes(
                order.toLowerCase()
            )
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Sort order must be asc or desc"
            });
        }

        const users =
            await adminService.getUsers({
                search: search
                    ? search.trim()
                    : "",
                role,
                sortBy,
                order: order
                    ? order.toLowerCase()
                    : "asc"
            });

        return res.status(200).json({
            success: true,
            count: users.length,
            data: users
        });

    } catch (error) {

        console.error(
            "Get users error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to fetch users"
        });
    }
};

const getUserById = async (req, res) => {

    try {

        const { id } = req.params;

        if (!/^\d+$/.test(id)) {

            return res.status(400).json({
                success: false,
                message:
                    "User ID must be a valid number"
            });
        }

        const user =
            await adminService.getUserById(
                Number(id)
            );

        return res.status(200).json({
            success: true,
            data: user
        });

    } catch (error) {

        if (
            error.message ===
            "User not found"
        ) {
            return res.status(404).json({
                success: false,
                message:
                    "User not found"
            });
        }

        console.error(
            "Get user details error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to fetch user details"
        });
    }
};

const createStore = async (req, res) => {

    try {

        const {
            name,
            email,
            address,
            ownerId
        } = req.body;

        const errors =
            validateCreateStoreData({
                name,
                email,
                address,
                ownerId
            });

        if (
            Object.keys(errors).length > 0
        ) {
            return res.status(400).json({
                success: false,
                errors
            });
        }

        const store =
            await adminService.createStore({
                name: name.trim(),
                email: email
                    .trim()
                    .toLowerCase(),
                address: address.trim(),
                ownerId: Number(ownerId)
            });

        return res.status(201).json({
            success: true,
            message:
                "Store created successfully",
            store
        });

    } catch (error) {

        if (
            error.message ===
            "Store email is already registered"
        ) {
            return res.status(409).json({
                success: false,
                message: error.message
            });
        }

        if (
            error.message ===
            "Store owner not found"
        ) {
            return res.status(404).json({
                success: false,
                message: error.message
            });
        }

        if (
            error.message ===
            "Selected user is not a store owner"
        ) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }

        console.error(
            "Create store error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to create store"
        });
    }
};

module.exports = {
    getDashboard,
    createUser,
    getUsers,
    getUserById,
    createStore
};