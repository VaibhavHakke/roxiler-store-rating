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

router.get(
    "/stores",
    authenticate,
    authorizeRoles("USER"),
    getStores
);

router.post(
    "/stores/:storeId/rating",
    authenticate,
    authorizeRoles("USER"),
    submitRating
);

router.put(
    "/stores/:storeId/rating",
    authenticate,
    authorizeRoles("USER"),
    modifyRating
);

router.put(
    "/password",
    authenticate,
    authorizeRoles("USER"),
    updatePassword
);


module.exports = router;