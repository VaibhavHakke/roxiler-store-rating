const db = require("../config/db");

const findUserByEmail = async (email) => {
    const [rows] = await db.execute(
        "SELECT * FROM users WHERE email = ?",
        [email]
    );

    return rows[0];
};

const createUser = async ({
    name,
    email,
    password,
    address,
    role = "USER"
}) => {
    const [result] = await db.execute(
        `INSERT INTO users
        (name, email, password, address, role)
        VALUES (?, ?, ?, ?, ?)`,
        [name, email, password, address, role]
    );

    return result.insertId;
};

const findUserById = async (id) => {
    const [rows] = await db.execute(
        `SELECT
            id,
            name,
            email,
            address,
            role,
            created_at,
            updated_at
         FROM users
         WHERE id = ?`,
        [id]
    );

    return rows[0];
};

const createUserByAdmin = async ({
    name,
    email,
    password,
    address,
    role
}) => {
    const [result] = await db.execute(
        `INSERT INTO users
        (name, email, password, address, role)
        VALUES (?, ?, ?, ?, ?)`,
        [name, email, password, address, role]
    );

    return result.insertId;
};


/*
 * Get all stores for a normal user.
 *
 * Returns:
 * - Store name
 * - Store address
 * - Overall rating
 * - Logged-in user's submitted rating
 */
const getStoresForUser = async ({
    userId,
    search,
    sortBy,
    order
}) => {

    let query = `
        SELECT
            s.id,
            s.name,
            s.address,

            COALESCE(
                ROUND(AVG(r.rating), 2),
                0
            ) AS overallRating,

            MAX(
                CASE
                    WHEN r.user_id = ?
                    THEN r.rating
                    ELSE NULL
                END
            ) AS userRating

        FROM stores s

        LEFT JOIN ratings r
            ON s.id = r.store_id

        WHERE 1 = 1
    `;

    const params = [userId];

    if (search) {

        query += `
            AND (
                s.name LIKE ?
                OR s.address LIKE ?
            )
        `;

        const searchValue = `%${search}%`;

        params.push(
            searchValue,
            searchValue
        );
    }

    query += `
        GROUP BY
            s.id,
            s.name,
            s.address
    `;

    const allowedSortColumns = {
        name: "s.name",
        address: "s.address",
        overallRating: "overallRating"
    };

    const selectedSortColumn =
        allowedSortColumns[sortBy] || "s.name";

    const selectedOrder =
        order === "desc"
            ? "DESC"
            : "ASC";

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


/*
 * Find a store by ID.
 */
const findStoreById = async (storeId) => {

    const [rows] = await db.execute(
        `SELECT
            id,
            name,
            email,
            address,
            owner_id
         FROM stores
         WHERE id = ?`,
        [storeId]
    );

    return rows[0];
};


/*
 * Find a user's rating for a particular store.
 */
const findUserRating = async (
    userId,
    storeId
) => {

    const [rows] = await db.execute(
        `SELECT
            id,
            user_id,
            store_id,
            rating,
            created_at,
            updated_at
         FROM ratings
         WHERE user_id = ?
         AND store_id = ?`,
        [
            userId,
            storeId
        ]
    );

    return rows[0];
};


/*
 * Create a new rating.
 */
const createRating = async ({
    userId,
    storeId,
    rating
}) => {

    const [result] = await db.execute(
        `INSERT INTO ratings
        (user_id, store_id, rating)
        VALUES (?, ?, ?)`,
        [
            userId,
            storeId,
            rating
        ]
    );

    return result.insertId;
};


/*
 * Update an existing rating.
 */
const updateRating = async ({
    userId,
    storeId,
    rating
}) => {

    const [result] = await db.execute(
        `UPDATE ratings
         SET rating = ?,
             updated_at = CURRENT_TIMESTAMP
         WHERE user_id = ?
         AND store_id = ?`,
        [
            rating,
            userId,
            storeId
        ]
    );

    return result.affectedRows;
};


/*
 * Update user's password.
 */
const updatePassword = async (
    userId,
    password
) => {

    const [result] = await db.execute(
        `UPDATE users
         SET password = ?,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [
            password,
            userId
        ]
    );

    return result.affectedRows;
};


module.exports = {
    findUserByEmail,
    createUser,
    findUserById,
    createUserByAdmin,

    getStoresForUser,
    findStoreById,
    findUserRating,
    createRating,
    updateRating,
    updatePassword
};