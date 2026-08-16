const userModel =
    require("../models/userModel");

const getDashboard = async (ownerId) => {

    // Find the store owned by the logged-in user
    const store =
        await userModel.findStoreByOwnerId(
            ownerId
        );

    if (!store) {

        const error = new Error(
            "Store not found for this owner"
        );

        error.statusCode = 404;

        throw error;
    }


    // Get all ratings submitted for this owner's store
    const ratings =
        await userModel.getStoreRatingsByOwner(
            ownerId
        );


    // Calculate average rating
    let averageRating = 0;

    if (ratings.length > 0) {

        const total =
            ratings.reduce(
                (sum, item) => {
                    return sum + Number(item.rating);
                },
                0
            );

        averageRating =
            Number(
                (total / ratings.length)
                    .toFixed(2)
            );
    }


    return {

        store: {
            id: store.id,
            name: store.name,
            email: store.email,
            address: store.address
        },

        averageRating,

        totalRatings:
            ratings.length,

        ratings
    };
};


module.exports = {
    getDashboard
};