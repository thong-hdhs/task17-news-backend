module.exports = (error, req, res, next) => {
    if (res.headersSent) return next(error);

    let status = error.status || 500;
    let message = error.message || "Internal server error";

    if (error.name === "ValidationError" || error.name === "CastError") {
        status = 400;
        message =
            error.name === "ValidationError"
                ? error.message
                : "Invalid resource ID";
    } else if (error.code === 11000) {
        status = 409;
        message = "An account with this email already exists";
    } else if (status >= 500) {
        message = "Internal server error";
        console.error(error);
    }

    res.status(status).json({ success: false, status, message });
};
