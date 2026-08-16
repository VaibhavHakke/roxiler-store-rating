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
            message: "Failed to create user"
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

        /*
         * Validate role if it is provided.
         */
        if (
            role &&
            !["USER", "ADMIN", "STORE_OWNER"]
                .includes(role)
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid role. Allowed roles are USER, ADMIN and STORE_OWNER"
            });
        }

        /*
         * Validate sorting column.
         */
        const allowedSortColumns = [
            "name",
            "email",
            "address",
            "role",
            "createdAt"
        ];

        if (
            sortBy &&
            !allowedSortColumns.includes(sortBy)
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid sort field"
            });
        }

        /*
         * Validate sorting order.
         */
        if (
            order &&
            !["asc", "desc"].includes(
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
            message: "Failed to fetch users"
        });
    }
};

module.exports = {
    getDashboard,
    createUser,
    getUsers
};