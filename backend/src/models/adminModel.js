const db = require("../config/db");

const getDashboardCounts = async () => {
    const [rows] = await db.execute(`
        SELECT
            (SELECT COUNT(*) FROM users) AS totalUsers,
            (SELECT COUNT(*) FROM stores) AS totalStores,
            (SELECT COUNT(*) FROM ratings) AS totalRatings
    `);

    return rows[0];
};

module.exports = {
    getDashboardCounts
};