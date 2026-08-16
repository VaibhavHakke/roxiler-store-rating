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

const getUsers = async ({
    search,
    role,
    sortBy,
    order
}) => {

    let query = `
        SELECT
            id,
            name,
            email,
            address,
            role,
            created_at,
            updated_at
        FROM users
        WHERE 1 = 1
    `;

    const params = [];

    /*
     * Search by name, email or address.
     */
    if (search) {
        query += `
            AND (
                name LIKE ?
                OR email LIKE ?
                OR address LIKE ?
            )
        `;

        const searchValue = `%${search}%`;

        params.push(
            searchValue,
            searchValue,
            searchValue
        );
    }

    /*
     * Filter by role.
     */
    if (role) {
        query += ` AND role = ?`;
        params.push(role);
    }

    /*
     * Sorting.
     *
     * Column names cannot safely be passed as
     * normal SQL parameters, so we use a whitelist.
     */
    const allowedSortColumns = {
        name: "name",
        email: "email",
        address: "address",
        role: "role",
        createdAt: "created_at"
    };

    const selectedSortColumn =
        allowedSortColumns[sortBy] || "created_at";

    const selectedOrder =
        order === "desc" ? "DESC" : "ASC";

    query += `
        ORDER BY ${selectedSortColumn} ${selectedOrder}
    `;

    const [rows] = await db.execute(
        query,
        params
    );

    return rows;
};

module.exports = {
    getDashboardCounts,
    getUsers
};