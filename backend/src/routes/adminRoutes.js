const express = require("express");

const {
    getDashboard,
    createUser,
    getUsers,
    getUserById,
    createStore,
    getStores
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

router.post(
    "/stores",
    authenticate,
    authorizeRoles("ADMIN"),
    createStore
);

router.get(
    "/stores",
    authenticate,
    authorizeRoles("ADMIN"),
    getStores
);

module.exports = router;