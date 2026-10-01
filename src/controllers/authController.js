const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { HttpError, asyncHandler, sendSuccess } = require("../utils/http");

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const register = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body;
    if (
        typeof username !== "string" ||
        username.trim().length < 2 ||
        username.trim().length > 50
    ) {
        throw new HttpError(
            400,
            "username must be between 2 and 50 characters",
        );
    }
    if (typeof email !== "string" || !emailPattern.test(email.trim())) {
        throw new HttpError(400, "A valid email is required");
    }
    if (typeof password !== "string" || password.length < 8) {
        throw new HttpError(400, "password must be at least 8 characters");
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (await User.exists({ email: normalizedEmail })) {
        throw new HttpError(409, "An account with this email already exists");
    }

    const user = await User.create({
        username: username.trim(),
        email: normalizedEmail,
        password,
    });
    return sendSuccess(res, 201, "Account registered successfully", {
        user: {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
        },
    });
});

const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    if (typeof email !== "string" || typeof password !== "string") {
        throw new HttpError(400, "email and password are required");
    }

    const user = await User.findOne({
        email: email.trim().toLowerCase(),
    }).select("+password");
    const passwordMatches = user
        ? await bcrypt.compare(password, user.password)
        : false;
    if (!passwordMatches) {
        throw new HttpError(401, "Invalid email or password");
    }

    const token = jwt.sign(
        { sub: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || "1d" },
    );

    return sendSuccess(res, 200, "Login successful", {
        token,
        tokenType: "Bearer",
        expiresIn: process.env.JWT_EXPIRES_IN || "1d",
        user: {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
        },
    });
});

module.exports = { register, login };
