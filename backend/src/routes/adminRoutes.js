const express = require("express");

const {
    getDashboard,
    createUser,
    getUsers,
    getUserById
} = require("../controllers/adminController");

const authenticate =
    require("../middleware/authMiddleware");

const authorizeRoles =
    require("../middleware/roleMiddleware");

const router = express.Router();

router.get(
    "/dashboard",
    authenticate,
    authorizeRoles("ADMIN"),
    getDashboard
);

router.post(
    "/users",
    authenticate,
    authorizeRoles("ADMIN"),
    createUser
);

router.get(
    "/users",
    authenticate,
    authorizeRoles("ADMIN"),
    getUsers
);

router.get(
    "/users/:id",
    authenticate,
    authorizeRoles("ADMIN"),
    getUserById
);

module.exports = router;