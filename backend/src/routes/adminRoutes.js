const express = require("express");

const {
    getDashboard
} = require("../controllers/adminController");

const authenticate = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

router.get(
    "/dashboard",
    authenticate,
    authorizeRoles("ADMIN"),
    getDashboard
);

module.exports = router;