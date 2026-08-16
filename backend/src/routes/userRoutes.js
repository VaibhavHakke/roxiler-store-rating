const express = require("express");

const {
    getStores,
    submitRating,
    modifyRating,
    updatePassword
} = require("../controllers/userController");

const authenticate =
    require("../middleware/authMiddleware");

const authorizeRoles =
    require("../middleware/roleMiddleware");

const router = express.Router();


// ==========================================
// NORMAL USER - STORE LISTING
// ==========================================

router.get(
    "/stores",
    authenticate,
    authorizeRoles("USER"),
    getStores
);


// ==========================================
// NORMAL USER - SUBMIT RATING
// ==========================================

router.post(
    "/stores/:storeId/rating",
    authenticate,
    authorizeRoles("USER"),
    submitRating
);


// ==========================================
// NORMAL USER - MODIFY RATING
// ==========================================

router.put(
    "/stores/:storeId/rating",
    authenticate,
    authorizeRoles("USER"),
    modifyRating
);


// ==========================================
// NORMAL USER - UPDATE PASSWORD
// ==========================================

router.put(
    "/password",
    authenticate,
    authorizeRoles("USER"),
    updatePassword
);


module.exports = router;