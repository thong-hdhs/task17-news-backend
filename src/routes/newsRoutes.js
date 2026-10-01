const express = require("express");
const {
    listPublicNews,
    getPublicNewsById,
} = require("../controllers/newsController");

const router = express.Router();

/**
 * @swagger
 * /api/news:
 *   get:
 *     summary: List published news
 *     tags: [Public News]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, minimum: 1, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, minimum: 1, maximum: 100, default: 10 }
 *       - in: query
 *         name: keyword
 *         schema: { type: string }
 *         description: Case-insensitive search in title and content
 *       - in: query
 *         name: sortBy
 *         schema: { type: string, enum: [createdAt, updatedAt, title], default: createdAt }
 *       - in: query
 *         name: order
 *         schema: { type: string, enum: [asc, desc], default: desc }
 *     responses:
 *       200: { description: News items and pagination metadata }
 *       400: { description: Invalid query parameters }
 */
router.get("/", listPublicNews);

/**
 * @swagger
 * /api/news/{id}:
 *   get:
 *     summary: Get a published news article by ID
 *     tags: [Public News]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: News article }
 *       400: { description: Invalid ID }
 *       404: { description: Article not found }
 */
router.get("/:id", getPublicNewsById);

module.exports = router;
