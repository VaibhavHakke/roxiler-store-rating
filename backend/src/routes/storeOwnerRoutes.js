const express = require("express");

const authenticate =
    require("../middleware/authMiddleware");

const authorizeRoles =
    require("../middleware/roleMiddleware");

const {
    getDashboard
} = require("../controllers/storeOwnerController");

const router = express.Router();


// ==========================================
// STORE OWNER DASHBOARD
// ==========================================

router.get(
    "/dashboard",
    authenticate,
    authorizeRoles("STORE_OWNER"),
    getDashboard
);


module.exports = router;