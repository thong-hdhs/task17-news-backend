const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const adminAuth = require("../middleware/adminAuth");
const { asyncHandler, sendSuccess, HttpError } = require("../utils/http");
const uploadsDirectory = require("../config/uploads");

const router = express.Router();

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        fs.mkdir(uploadsDirectory, { recursive: true }, (error) => {
            callback(error, uploadsDirectory);
        });
    },
    filename: (req, file, callback) => {
        const extension = path.extname(file.originalname).toLowerCase();
        const safeExtension = /^\.[a-z0-9]{1,10}$/.test(extension)
            ? extension
            : "";
        callback(null, `${crypto.randomUUID()}${safeExtension}`);
    },
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

/**
 * @swagger
 * /api/admin/files/upload:
 *   post:
 *     summary: Upload a file as an admin
 *     tags: [Admin Files]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [file]
 *             properties:
 *               file: { type: string, format: binary }
 *     responses:
 *       201: { description: File uploaded; data.fileUrl is publicly accessible }
 *       400: { description: Missing file or invalid upload }
 *       401: { description: Missing or invalid token }
 *       403: { description: Admin role required }
 *       413: { description: File exceeds the 10 MB limit }
 */
router.post("/upload", adminAuth, upload.single("file"), (req, res, next) => {
    if (!req.file) {
        return next(new HttpError(400, "A file is required"));
    }
    const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
    return sendSuccess(res, 201, "File uploaded successfully", { fileUrl });
});

/**
 * @swagger
 * /api/admin/files:
 *   delete:
 *     summary: Delete an uploaded file as an admin
 *     tags: [Admin Files]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fileUrl: { type: string, description: Public URL returned by upload }
 *               path: { type: string, description: Public /uploads path returned by upload }
 *               filename: { type: string, description: Stored filename returned by upload }
 *     responses:
 *       200: { description: File deleted }
 *       400: { description: Invalid file reference }
 *       401: { description: Missing or invalid token }
 *       403: { description: Admin role required }
 *       404: { description: File not found }
 */
router.delete(
    "/",
    adminAuth,
    asyncHandler(async (req, res) => {
        const reference =
            req.body?.fileUrl || req.body?.path || req.body?.filename;
        if (typeof reference !== "string" || !reference.trim()) {
            throw new HttpError(400, "fileUrl, path or filename is required");
        }

        let filename = reference.trim();
        if (filename.startsWith("http://") || filename.startsWith("https://")) {
            try {
                const parsedUrl = new URL(filename);
                if (!parsedUrl.pathname.startsWith("/uploads/")) {
                    throw new HttpError(
                        400,
                        "The file URL must point to /uploads",
                    );
                }
                filename = path.basename(
                    decodeURIComponent(parsedUrl.pathname),
                );
            } catch (error) {
                if (error instanceof HttpError) throw error;
                throw new HttpError(400, "Invalid file URL");
            }
        } else if (filename.startsWith("/uploads/")) {
            filename = path.basename(filename);
        }

        if (
            !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}(\.[a-z0-9]{1,10})?$/i.test(
                filename,
            )
        ) {
            throw new HttpError(400, "Invalid uploaded filename");
        }

        const filePath = path.join(uploadsDirectory, filename);
        try {
            await fs.promises.unlink(filePath);
        } catch (error) {
            if (error.code === "ENOENT") {
                throw new HttpError(404, "File not found");
            }
            throw error;
        }
        return sendSuccess(res, 200, "File deleted successfully", null);
    }),
);

module.exports = router;
