const userService = require("../services/userService");


const getStores = async (req, res) => {

    try {

        const userId = req.user.id;

        const {
            search,
            sortBy,
            order
        } = req.query;

        const stores =
            await userService.getStores({
                userId,
                search,
                sortBy,
                order
            });

        return res.status(200).json({
            success: true,
            count: stores.length,
            data: stores
        });

    } catch (error) {

        console.error(
            "Get user stores error:",
            error
        );

        return res.status(
            error.statusCode || 500
        ).json({
            success: false,
            message:
                error.message ||
                "Internal server error"
        });
    }
};


const submitRating = async (req, res) => {

    try {

        const userId = req.user.id;

        const storeId =
            Number(req.params.storeId);

        const rating =
            Number(req.body.rating);

        if (
            !Number.isInteger(rating) ||
            rating < 1 ||
            rating > 5
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Rating must be an integer between 1 and 5"
            });
        }

        const result =
            await userService.submitRating({
                userId,
                storeId,
                rating
            });

        return res.status(201).json({
            success: true,
            message:
                "Rating submitted successfully",
            data: result
        });

    } catch (error) {

        console.error(
            "Submit rating error:",
            error
        );

        return res.status(
            error.statusCode || 500
        ).json({
            success: false,
            message:
                error.message ||
                "Internal server error"
        });
    }
};


const modifyRating = async (req, res) => {

    try {

        const userId = req.user.id;

        const storeId =
            Number(req.params.storeId);

        const rating =
            Number(req.body.rating);

        if (
            !Number.isInteger(rating) ||
            rating < 1 ||
            rating > 5
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Rating must be an integer between 1 and 5"
            });
        }

        const result =
            await userService.modifyRating({
                userId,
                storeId,
                rating
            });

        return res.status(200).json({
            success: true,
            message:
                "Rating updated successfully",
            data: result
        });

    } catch (error) {

        console.error(
            "Modify rating error:",
            error
        );

        return res.status(
            error.statusCode || 500
        ).json({
            success: false,
            message:
                error.message ||
                "Internal server error"
        });
    }
};


const updatePassword = async (req, res) => {

    try {

        const userId = req.user.id;

        const {
            currentPassword,
            newPassword
        } = req.body;

        if (!currentPassword || !newPassword) {

            return res.status(400).json({
                success: false,
                message:
                    "Current password and new password are required"
            });
        }

        if (
            newPassword.length < 8 ||
            newPassword.length > 16 ||
            !/[A-Z]/.test(newPassword) ||
            !/[^A-Za-z0-9]/.test(newPassword)
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Password must be 8-16 characters and contain at least one uppercase letter and one special character"
            });
        }

        await userService.updateUserPassword({
            userId,
            currentPassword,
            newPassword
        });

        return res.status(200).json({
            success: true,
            message:
                "Password updated successfully"
        });

    } catch (error) {

        console.error(
            "Update password error:",
            error
        );

        return res.status(
            error.statusCode || 500
        ).json({
            success: false,
            message:
                error.message ||
                "Internal server error"
        });
    }
};


module.exports = {
    getStores,
    submitRating,
    modifyRating,
    updatePassword
};