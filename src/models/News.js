const mongoose = require("mongoose");

const newsSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true, maxlength: 200 },
        content: { type: String, required: true, trim: true },
        thumbnail: { type: String, required: true, trim: true },
        status: {
            type: String,
            enum: ["draft", "published"],
            default: "published",
            index: true,
        },
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    },
    { timestamps: true },
);

module.exports = mongoose.model("News", newsSchema);
