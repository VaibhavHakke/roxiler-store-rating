const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const userModel = require("../models/userModel");

const registerUser = async ({
    name,
    email,
    address,
    password
}) => {

    const existingUser = await userModel.findUserByEmail(email);

    if (existingUser) {
        throw new Error("Email is already registered");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const userId = await userModel.createUser({
        name,
        email,
        password: hashedPassword,
        address,
        role: "USER"
    });

    return {
        id: userId,
        name,
        email,
        address,
        role: "USER"
    };
};

const loginUser = async (email, password) => {

    const user = await userModel.findUserByEmail(email);

    if (!user) {
        throw new Error("Invalid email or password");
    }

    const passwordMatch = await bcrypt.compare(
        password,
        user.password
    );

    if (!passwordMatch) {
        throw new Error("Invalid email or password");
    }

    const token = jwt.sign(
        {
            id: user.id,
            role: user.role
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "1d"
        }
    );

    return {
        token,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            address: user.address,
            role: user.role
        }
    };
};

module.exports = {
    registerUser,
    loginUser
};