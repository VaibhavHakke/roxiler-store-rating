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

    if (role) {

        query += `
            AND role = ?
        `;

        params.push(role);
    }

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
        order === "desc"
            ? "DESC"
            : "ASC";

    query += `
        ORDER BY ${selectedSortColumn} ${selectedOrder}
    `;

    const [rows] = await db.execute(
        query,
        params
    );

    return rows;
};

const createStore = async ({
    name,
    email,
    address,
    ownerId
}) => {

    const [result] = await db.execute(
        `INSERT INTO stores
        (name, email, address, owner_id)
        VALUES (?, ?, ?, ?)`,
        [
            name,
            email,
            address,
            ownerId
        ]
    );

    return result.insertId;
};

const findStoreByEmail = async (email) => {

    const [rows] = await db.execute(
        `SELECT
            id,
            name,
            email,
            address,
            owner_id
         FROM stores
         WHERE email = ?`,
        [email]
    );

    return rows[0];
};

const findStoreOwnerById = async (ownerId) => {

    const [rows] = await db.execute(
        `SELECT
            id,
            name,
            email,
            role
         FROM users
         WHERE id = ?`,
        [ownerId]
    );

    return rows[0];
};

const getStores = async ({
    search,
    sortBy,
    order
}) => {

    let query = `
        SELECT
            s.id,
            s.name,
            s.email,
            s.address,
            s.owner_id AS ownerId,
            u.name AS ownerName,
            u.email AS ownerEmail,
            COALESCE(AVG(r.rating), 0) AS rating
        FROM stores s
        INNER JOIN users u
            ON s.owner_id = u.id
        LEFT JOIN ratings r
            ON s.id = r.store_id
        WHERE 1 = 1
    `;

    const params = [];

    if (search) {

        query += `
            AND (
                s.name LIKE ?
                OR s.email LIKE ?
                OR s.address LIKE ?
                OR u.name LIKE ?
                OR u.email LIKE ?
            )
        `;

        const searchValue = `%${search}%`;

        params.push(
            searchValue,
            searchValue,
            searchValue,
            searchValue,
            searchValue
        );
    }

    const allowedSortColumns = {
        name: "s.name",
        email: "s.email",
        address: "s.address",
        ownerName: "u.name",
        ownerEmail: "u.email",
        rating: "rating",
        createdAt: "s.created_at"
    };

    const selectedSortColumn =
        allowedSortColumns[sortBy] ||
        "s.created_at";

    const selectedOrder =
        order === "desc"
            ? "DESC"
            : "ASC";

    query += `
        GROUP BY
            s.id,
            s.name,
            s.email,
            s.address,
            s.owner_id,
            u.name,
            u.email
    `;

    query += `
        ORDER BY
            ${selectedSortColumn}
            ${selectedOrder}
    `;

    const [rows] = await db.execute(
        query,
        params
    );

    return rows;
};

module.exports = {
    getDashboardCounts,
    getUsers,
    createStore,
    findStoreByEmail,
    findStoreOwnerById,
    getStores
};