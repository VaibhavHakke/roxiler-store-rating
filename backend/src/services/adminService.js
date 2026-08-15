const adminModel = require("../models/adminModel");

const getDashboardData = async () => {
    const counts = await adminModel.getDashboardCounts();

    return {
        totalUsers: Number(counts.totalUsers),
        totalStores: Number(counts.totalStores),
        totalRatings: Number(counts.totalRatings)
    };
};

module.exports = {
    getDashboardData
};