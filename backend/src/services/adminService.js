const bcrypt = require("bcrypt");

const adminModel =
    require("../models/adminModel");

const userModel =
    require("../models/userModel");

const getDashboardData = async () => {

    const counts =
        await adminModel.getDashboardCounts();

    return {
        totalUsers: Number(
            counts.totalUsers
        ),
        totalStores: Number(
            counts.totalStores
        ),
        totalRatings: Number(
            counts.totalRatings
        )
    };
};

const createUser = async ({
    name,
    email,
    password,
    address,
    role
}) => {

    const existingUser =
        await userModel.findUserByEmail(
            email
        );

    if (existingUser) {
        throw new Error(
            "Email is already registered"
        );
    }

    const hashedPassword =
        await bcrypt.hash(
            password,
            10
        );

    const userId =
        await userModel.createUserByAdmin({
            name,
            email,
            password: hashedPassword,
            address,
            role
        });

    return {
        id: userId,
        name,
        email,
        address,
        role
    };
};

const getUsers = async ({
    search,
    role,
    sortBy,
    order
}) => {

    return await adminModel.getUsers({
        search,
        role,
        sortBy,
        order
    });
};

const getUserById = async (id) => {

    const user =
        await userModel.findUserById(id);

    if (!user) {
        throw new Error(
            "User not found"
        );
    }

    return user;
};

const createStore = async ({
    name,
    email,
    address,
    ownerId
}) => {

    const existingStore =
        await adminModel.findStoreByEmail(
            email
        );

    if (existingStore) {
        throw new Error(
            "Store email is already registered"
        );
    }

    const owner =
        await adminModel.findStoreOwnerById(
            ownerId
        );

    if (!owner) {
        throw new Error(
            "Store owner not found"
        );
    }

    if (owner.role !== "STORE_OWNER") {
        throw new Error(
            "Selected user is not a store owner"
        );
    }

    const storeId =
        await adminModel.createStore({
            name,
            email,
            address,
            ownerId
        });

    return {
        id: storeId,
        name,
        email,
        address,
        ownerId,
        owner: {
            id: owner.id,
            name: owner.name,
            email: owner.email
        }
    };
};

const getStores = async ({
    search,
    sortBy,
    order
}) => {

    return await adminModel.getStores({
        search,
        sortBy,
        order
    });
};

module.exports = {
    getDashboardData,
    createUser,
    getUsers,
    getUserById,
    createStore,
    getStores
};