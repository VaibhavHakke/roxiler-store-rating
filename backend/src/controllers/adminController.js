const adminService = require("../services/adminService");

const getDashboard = async (req, res) => {
    try {
        const dashboardData = await adminService.getDashboardData();

        return res.status(200).json({
            success: true,
            data: dashboardData
        });
    } catch (error) {
        console.error("Admin dashboard error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch dashboard data"
        });
    }
};

module.exports = {
    getDashboard
};