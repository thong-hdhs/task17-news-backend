const mongoose = require("mongoose");
const News = require("../models/News");
const { asyncHandler, sendSuccess, HttpError } = require("../utils/http");

const allowedFields = new Set(["title", "content", "thumbnail", "status"]);
const allowedSortFields = new Set(["createdAt", "updatedAt", "title"]);

function escapeRegex(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function validateNewsInput(body, requireAll = false) {
    if (!body || typeof body !== "object" || Array.isArray(body)) {
        throw new HttpError(400, "A JSON object is required");
    }

    const keys = Object.keys(body);
    if (keys.some((key) => !allowedFields.has(key))) {
        throw new HttpError(
            400,
            "Only title, content, thumbnail and status can be changed",
        );
    }
    if (
        requireAll &&
        ["title", "content", "thumbnail"].some((key) => !(key in body))
    ) {
        throw new HttpError(400, "title, content and thumbnail are required");
    }
    if (keys.length === 0) {
        throw new HttpError(400, "At least one field must be provided");
    }

    const updates = {};
    for (const field of ["title", "content", "thumbnail"]) {
        if (field in body) {
            if (typeof body[field] !== "string" || !body[field].trim()) {
                throw new HttpError(400, `${field} must be a non-empty string`);
            }
            updates[field] = body[field].trim();
        }
    }
    if ("status" in body) {
        if (!["draft", "published"].includes(body.status)) {
            throw new HttpError(400, "status must be draft or published");
        }
        updates.status = body.status;
    }
    return updates;
}

const createNews = asyncHandler(async (req, res) => {
    const fields = validateNewsInput(req.body, true);
    const news = await News.create({
        ...fields,
        status: fields.status || "published",
        createdBy: req.user.id,
    });

    return sendSuccess(res, 201, "News created successfully", news);
});

const getAdminNews = asyncHandler(async (req, res) => {
    const page = req.query.page === undefined ? 1 : Number(req.query.page);
    const limit = req.query.limit === undefined ? 10 : Number(req.query.limit);
    const sortBy = req.query.sortBy || "createdAt";
    const rawOrder = req.query.order || "desc";

    if (!Number.isInteger(page) || page < 1) {
        throw new HttpError(400, "page must be a positive integer");
    }
    if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
        throw new HttpError(400, "limit must be between 1 and 100");
    }
    if (!allowedSortFields.has(sortBy)) {
        throw new HttpError(
            400,
            "sortBy must be one of: createdAt, updatedAt, title",
        );
    }
    if (typeof rawOrder !== "string") {
        throw new HttpError(400, "order must be asc or desc");
    }
    const order = rawOrder.toLowerCase();
    if (order !== "asc" && order !== "desc") {
        throw new HttpError(400, "order must be asc or desc");
    }
    if (
        req.query.keyword !== undefined &&
        typeof req.query.keyword !== "string"
    ) {
        throw new HttpError(400, "keyword must be a string");
    }

    const filter = {};
    const keyword = req.query.keyword?.trim();
    if (keyword) {
        const search = new RegExp(escapeRegex(keyword), "i");
        filter.$or = [{ title: search }, { content: search }];
    }

    const [items, total] = await Promise.all([
        News.find(filter)
            .sort({ [sortBy]: order === "asc" ? 1 : -1, _id: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean(),
        News.countDocuments(filter),
    ]);

    return sendSuccess(res, 200, "News retrieved successfully", {
        items,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    });
});

const updateNews = asyncHandler(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        throw new HttpError(400, "Invalid news ID");
    }
    const updates = validateNewsInput(req.body);
    const news = await News.findByIdAndUpdate(
        req.params.id,
        { $set: updates },
        { new: true, runValidators: true },
    );

    if (!news) {
        throw new HttpError(404, "News article not found");
    }
    return sendSuccess(res, 200, "News updated successfully", news);
});

const deleteNews = asyncHandler(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        throw new HttpError(400, "Invalid news ID");
    }
    const news = await News.findByIdAndDelete(req.params.id);
    if (!news) {
        throw new HttpError(404, "News article not found");
    }
    return sendSuccess(res, 200, "News deleted successfully", null);
});

module.exports = { createNews, getAdminNews, updateNews, deleteNews };
