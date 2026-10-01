const mongoose = require("mongoose");
const News = require("../models/News");
const { HttpError, asyncHandler, sendSuccess } = require("../utils/http");

const allowedSortFields = new Set(["createdAt", "updatedAt", "title"]);

function escapeRegex(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const listPublicNews = asyncHandler(async (req, res) => {
    const page = req.query.page === undefined ? 1 : Number(req.query.page);
    const limit = req.query.limit === undefined ? 10 : Number(req.query.limit);
    if (
        !Number.isInteger(page) ||
        page < 1 ||
        !Number.isInteger(limit) ||
        limit < 1 ||
        limit > 100
    ) {
        throw new HttpError(
            400,
            "page must be positive and limit must be between 1 and 100",
        );
    }

    const sortBy = req.query.sortBy || "createdAt";
    if (!allowedSortFields.has(sortBy)) {
        throw new HttpError(
            400,
            "sortBy must be one of: createdAt, updatedAt, title",
        );
    }
    const order = (req.query.order || "desc").toLowerCase();
    if (order !== "asc" && order !== "desc") {
        throw new HttpError(400, "order must be asc or desc");
    }

    const filter = { status: "published" };
    if (req.query.keyword !== undefined) {
        const keyword = String(req.query.keyword).trim();
        if (keyword) {
            const search = new RegExp(escapeRegex(keyword), "i");
            filter.$or = [{ title: search }, { content: search }];
        }
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

const getPublicNewsById = asyncHandler(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        throw new HttpError(400, "Invalid news ID");
    }

    const article = await News.findOne({
        _id: req.params.id,
        status: "published",
    }).lean();
    if (!article) {
        throw new HttpError(404, "News article not found");
    }
    return sendSuccess(res, 200, "News retrieved successfully", article);
});

module.exports = { listPublicNews, getPublicNewsById };
