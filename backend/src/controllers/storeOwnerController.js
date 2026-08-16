const storeOwnerService =
    require("../services/storeOwnerService");


// ==========================================
// STORE OWNER DASHBOARD
// ==========================================

const getDashboard = async (req, res) => {

    try {

        const ownerId = req.user.id;

        const dashboard =
            await storeOwnerService.getDashboard(
                ownerId
            );

        return res.status(200).json({
            success: true,
            data: dashboard
        });

    } catch (error) {

        console.error(
            "Store owner dashboard error:",
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
    getDashboard
};