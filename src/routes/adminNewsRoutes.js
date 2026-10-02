const express = require("express");
const adminNewsController = require("../controllers/adminNewsController");
const adminAuth = require("../middleware/adminAuth");

const router = express.Router();

// Áp dụng middleware phân quyền cho mọi route dưới đây
router.use(adminAuth);

/**
 * @swagger
 * /api/admin/news:
 *   post:
 *     summary: Create a news article
 *     tags: [Admin News]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, content, thumbnail]
 *             properties:
 *               title: { type: string, maxLength: 200 }
 *               content: { type: string }
 *               thumbnail: { type: string }
 *               status: { type: string, enum: [draft, published], default: published }
 *     responses:
 *       201: { description: Article created }
 *       400: { description: Invalid request }
 *       401: { description: Missing or invalid token }
 *       403: { description: Admin role required }
 */
router.post("/", adminNewsController.createNews);

/**
 * @swagger
 * /api/admin/news:
 *   get:
 *     summary: Search, sort and paginate all news for admins
 *     tags: [Admin News]
 *     security:
 *       - BearerAuth: []
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
 *       200: { description: All matching articles and pagination metadata }
 *       400: { description: Invalid query parameters }
 *       401: { description: Missing or invalid token }
 *       403: { description: Admin role required }
 */
router.get("/", adminNewsController.getAdminNews);

/**
 * @swagger
 * /api/admin/news/{id}:
 *   put:
 *     summary: Update a news article
 *     tags: [Admin News]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title: { type: string, maxLength: 200 }
 *               content: { type: string }
 *               thumbnail: { type: string }
 *               status: { type: string, enum: [draft, published] }
 *     responses:
 *       200: { description: Article updated }
 *       400: { description: Invalid ID or request }
 *       401: { description: Missing or invalid token }
 *       403: { description: Admin role required }
 *       404: { description: Article not found }
 */
router.put("/:id", adminNewsController.updateNews);

/**
 * @swagger
 * /api/admin/news/{id}:
 *   delete:
 *     summary: Delete a news article
 *     tags: [Admin News]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Article deleted }
 *       400: { description: Invalid ID }
 *       401: { description: Missing or invalid token }
 *       403: { description: Admin role required }
 *       404: { description: Article not found }
 */
router.delete("/:id", adminNewsController.deleteNews);

module.exports = router;
