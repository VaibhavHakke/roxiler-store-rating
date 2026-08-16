const validateCreateStoreData = ({
    name,
    email,
    address,
    ownerId
}) => {

    const errors = {};

    if (
        !name ||
        name.trim().length === 0
    ) {
        errors.name =
            "Store name is required";
    }

    if (
        !email ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
        errors.email =
            "Please provide a valid store email address";
    }

    if (
        !address ||
        address.trim().length === 0
    ) {
        errors.address =
            "Store address is required";
    }

    if (
        address &&
        address.trim().length > 400
    ) {
        errors.address =
            "Address must not exceed 400 characters";
    }

    if (
        ownerId === undefined ||
        ownerId === null ||
        !/^\d+$/.test(String(ownerId))
    ) {
        errors.ownerId =
            "A valid store owner ID is required";
    }

    return errors;
};

module.exports = {
    validateCreateStoreData
};