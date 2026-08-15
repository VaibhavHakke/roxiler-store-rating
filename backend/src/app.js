const express = require("express");
const cors = require("cors");
require("dotenv").config();

const db = require("./config/db");
const authRoutes = require("./routes/authRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        message: "Roxiler Store Rating API is running"
    });
});

app.get("/api/health", async (req, res) => {
    try {
        const connection = await db.getConnection();

        await connection.ping();

        connection.release();

        res.json({
            success: true,
            message: "API and database are connected"
        });
    } catch (error) {
        console.error(
            "Database connection failed:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Database connection failed"
        });
    }
});

app.use("/api/auth", authRoutes);

module.exports = app;