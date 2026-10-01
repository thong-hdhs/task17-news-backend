const News = require("../models/News");
const { asyncHandler, sendSuccess, HttpError } = require("../utils/http");

const createNews = asyncHandler(async (req, res) => {
    const { title, content, thumbnail, status } = req.body;

    if (!title || !content || !thumbnail) {
        throw new HttpError(400, "title, content và thumbnail là bắt buộc");
    }

    const news = await News.create({
        title: title.trim(),
        content: content.trim(),
        thumbnail: thumbnail.trim(),
        status: status || "published",
        createdBy: req.user.id // Lấy ID từ middleware adminAuth
    });

    return sendSuccess(res, 201, "Tạo tin tức thành công", news);
});

const getAdminNews = asyncHandler(async (req, res) => {
    const { keyword, sortBy = "createdAt", order = "desc", page = "1", limit = "10" } = req.query;

    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    const sortDirection = order === "desc" ? -1 : 1;

    // Admin có thể tìm thấy cả bài draft và published, tìm theo keyword ở title
    const query = keyword ? { title: { $regex: keyword, $options: "i" } } : {};

    const [items, total] = await Promise.all([
        News.find(query)
            .sort({ [sortBy]: sortDirection })
            .skip((pageNumber - 1) * limitNumber)
            .limit(limitNumber),
        News.countDocuments(query)
    ]);

    return sendSuccess(res, 200, "Lấy danh sách tin tức thành công", {
        items,
        pagination: {
            page: pageNumber,
            limit: limitNumber,
            total,
            totalPages: Math.ceil(total / limitNumber)
        }
    });
});

const updateNews = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    // runValidators: true để Mongoose vẫn check enum (draft/published) và độ dài
    const news = await News.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
    
    if (!news) {
        throw new HttpError(404, "Không tìm thấy tin tức");
    }

    return sendSuccess(res, 200, "Cập nhật tin tức thành công", news);
});

const deleteNews = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const news = await News.findByIdAndDelete(id);
    
    if (!news) {
        throw new HttpError(404, "Không tìm thấy tin tức");
    }

    return sendSuccess(res, 200, "Xóa tin tức thành công", null);
});

module.exports = { createNews, getAdminNews, updateNews, deleteNews };