const express = require("express");
const { register, login } = require("../controllers/authController");

const router = express.Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a user account
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, email, password]
 *             properties:
 *               username: { type: string, example: reader }
 *               email: { type: string, format: email, example: reader@example.com }
 *               password: { type: string, minLength: 8, example: securePass123 }
 *     responses:
 *       201: { description: Account created }
 *       400: { description: Invalid request }
 *       409: { description: Email already exists }
 */
router.post("/register", register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Log in and receive a JWT
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, format: email, example: reader@example.com }
 *               password: { type: string, example: securePass123 }
 *     responses:
 *       200: { description: Login successful }
 *       401: { description: Invalid credentials }
 */
router.post("/login", login);

module.exports = router;
