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
        `SELECT id, name, email, address, role, created_at, updated_at
         FROM users
         WHERE id = ?`,
        [id]
    );

    return rows[0];
};

module.exports = {
    findUserByEmail,
    createUser,
    findUserById
};