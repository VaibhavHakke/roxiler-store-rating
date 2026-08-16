const bcrypt = require("bcrypt");

const userModel = require("../models/userModel");


const getStores = async ({
    userId,
    search,
    sortBy,
    order
}) => {

    return await userModel.getStoresForUser({
        userId,
        search,
        sortBy,
        order
    });
};


const submitRating = async ({
    userId,
    storeId,
    rating
}) => {

    const store = await userModel.findStoreById(
        storeId
    );

    if (!store) {
        const error = new Error(
            "Store not found"
        );

        error.statusCode = 404;

        throw error;
    }

    const existingRating =
        await userModel.findUserRating(
            userId,
            storeId
        );

    if (existingRating) {

        const error = new Error(
            "You have already rated this store. Use the modify rating option."
        );

        error.statusCode = 409;

        throw error;
    }

    const ratingId =
        await userModel.createRating({
            userId,
            storeId,
            rating
        });

    return {
        id: ratingId,
        storeId,
        rating
    };
};


const modifyRating = async ({
    userId,
    storeId,
    rating
}) => {

    const store = await userModel.findStoreById(
        storeId
    );

    if (!store) {
        const error = new Error(
            "Store not found"
        );

        error.statusCode = 404;

        throw error;
    }

    const existingRating =
        await userModel.findUserRating(
            userId,
            storeId
        );

    if (!existingRating) {

        const error = new Error(
            "You have not rated this store yet. Submit a rating first."
        );

        error.statusCode = 404;

        throw error;
    }

    await userModel.updateRating({
        userId,
        storeId,
        rating
    });

    return {
        id: existingRating.id,
        storeId,
        rating
    };
};


const updateUserPassword = async ({
    userId,
    currentPassword,
    newPassword
}) => {

    const user = await userModel.findUserById(
        userId
    );

    if (!user) {

        const error = new Error(
            "User not found"
        );

        error.statusCode = 404;

        throw error;
    }

    /*
     * We need the password hash.
     * findUserByEmail returns the complete user row.
     */
    const fullUser =
        await userModel.findUserByEmail(
            user.email
        );

    const passwordMatches =
        await bcrypt.compare(
            currentPassword,
            fullUser.password
        );

    if (!passwordMatches) {

        const error = new Error(
            "Current password is incorrect"
        );

        error.statusCode = 400;

        throw error;
    }

    const hashedPassword =
        await bcrypt.hash(
            newPassword,
            10
        );

    await userModel.updatePassword(
        userId,
        hashedPassword
    );

    return true;
};


module.exports = {
    getStores,
    submitRating,
    modifyRating,
    updateUserPassword
};