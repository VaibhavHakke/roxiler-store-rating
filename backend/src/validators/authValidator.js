const validateRegisterData = ({
    name,
    email,
    address,
    password
}) => {

    const errors = {};

    if (!name || name.trim().length < 20 || name.trim().length > 60) {
        errors.name = "Name must be between 20 and 60 characters";
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.email = "Please provide a valid email address";
    }

    if (!address || address.trim().length > 400) {
        errors.address = "Address must not exceed 400 characters";
    }

    if (
        !password ||
        password.length < 8 ||
        password.length > 16
    ) {
        errors.password = "Password must be between 8 and 16 characters";
    }

    if (password && !/[A-Z]/.test(password)) {
        errors.password =
            "Password must contain at least one uppercase letter";
    }

    if (password && !/[!@#$%^&*(),.?":{}|<>_\-\\[\]/+=;']/g.test(password)) {
        errors.password =
            "Password must contain at least one special character";
    }

    return errors;
};

module.exports = {
    validateRegisterData
};