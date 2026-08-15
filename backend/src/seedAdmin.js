require("dotenv").config();

const bcrypt = require("bcrypt");

const db = require("./config/db");

const createAdmin = async () => {
    try {
        const name = "System Administrator Account";
        const email = "admin@roxiler.local";
        const password = "Admin@123";
        const address = "Roxiler System Administration";

        const [existingUsers] = await db.execute(
            "SELECT id FROM users WHERE email = ?",
            [email]
        );

        if (existingUsers.length > 0) {
            console.log("Admin account already exists.");
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await db.execute(
            `INSERT INTO users
            (name, email, password, address, role)
            VALUES (?, ?, ?, ?, ?)`,
            [
                name,
                email,
                hashedPassword,
                address,
                "ADMIN"
            ]
        );

        console.log("Admin account created successfully.");
        console.log("Email:", email);
        console.log("Password:", password);

    } catch (error) {
        console.error(
            "Failed to create admin account:",
            error.message
        );
    } finally {
        await db.end();
    }
};

createAdmin();