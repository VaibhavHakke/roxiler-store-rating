const db = require("../config/db");


const createResetToken = async ({
    userId,
    otpHash,
    expiresAt
}) => {

    const [result] = await db.execute(
        `
        INSERT INTO password_reset_tokens
        (
            user_id,
            otp_hash,
            expires_at
        )
        VALUES (?, ?, ?)
        `,
        [
            userId,
            otpHash,
            expiresAt
        ]
    );

    return result.insertId;
};


const findLatestValidToken = async (
    userId
) => {

    const [rows] = await db.execute(
        `
        SELECT *
        FROM password_reset_tokens
        WHERE user_id = ?
        AND used_at IS NULL
        AND expires_at > NOW()
        ORDER BY id DESC
        LIMIT 1
        `,
        [userId]
    );

    return rows[0];
};


const markTokenVerified = async (
    tokenId
) => {

    await db.execute(
        `
        UPDATE password_reset_tokens
        SET verified_at = NOW()
        WHERE id = ?
        `,
        [tokenId]
    );
};


const markTokenUsed = async (
    tokenId
) => {

    await db.execute(
        `
        UPDATE password_reset_tokens
        SET used_at = NOW()
        WHERE id = ?
        `,
        [tokenId]
    );
};


const invalidateOldTokens = async (
    userId
) => {

    await db.execute(
        `
        UPDATE password_reset_tokens
        SET used_at = NOW()
        WHERE user_id = ?
        AND used_at IS NULL
        `,
        [userId]
    );
};


module.exports = {
    createResetToken,
    findLatestValidToken,
    markTokenVerified,
    markTokenUsed,
    invalidateOldTokens
};
