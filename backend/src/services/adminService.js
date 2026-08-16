const bcrypt = require("bcrypt");

const adminModel = require("../models/adminModel");
const userModel = require("../models/userModel");

const getDashboardData = async () => {
    const counts = await adminModel.getDashboardCounts();

    return {
        totalUsers: Number(counts.totalUsers),
        totalStores: Number(counts.totalStores),
        totalRatings: Number(counts.totalRatings)
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
        await userModel.findUserByEmail(email);

    if (existingUser) {
        throw new Error("Email is already registered");
    }

    const hashedPassword =
        await bcrypt.hash(password, 10);

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

    const user = await userModel.findUserById(id);

    if (!user) {
        throw new Error("User not found");
    }

    return user;
};

module.exports = {
    getDashboardData,
    createUser,
    getUsers,
    getUserById
};