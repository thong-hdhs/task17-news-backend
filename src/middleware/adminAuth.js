const jwt = require("jsonwebtoken");
const { HttpError } = require("../utils/http");

module.exports = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return next(new HttpError(401, "Unauthorized: Không tìm thấy token"));
    }

    const token = authHeader.split(" ")[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        if (decoded.role !== "admin") {
            return next(new HttpError(403, "Forbidden: Yêu cầu quyền admin"));
        }
        
        // Payload của bạn lưu user.id vào trường "sub"
        req.user = { id: decoded.sub, role: decoded.role };
        next();
    } catch (error) {
        return next(new HttpError(401, "Unauthorized: Token không hợp lệ hoặc đã hết hạn"));
    }
};