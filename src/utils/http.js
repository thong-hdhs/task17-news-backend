class HttpError extends Error {
    constructor(status, message) {
        super(message);
        this.status = status;
    }
}

function asyncHandler(handler) {
    return (req, res, next) =>
        Promise.resolve(handler(req, res, next)).catch(next);
}

function sendSuccess(res, status, message, data) {
    return res.status(status).json({ success: true, status, message, data });
}

module.exports = { HttpError, asyncHandler, sendSuccess };
