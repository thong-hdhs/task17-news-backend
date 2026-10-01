const express = require("express");
const path = require("path");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");

const authRoutes = require("./routes/authRoutes");
const newsRoutes = require("./routes/newsRoutes");
const adminNewsRoutes = require("./routes/adminNewsRoutes");
const fileRoutes = require("./routes/fileRoutes");

const notFound = require("./middleware/notFound");
const errorHandler = require("./middleware/errorHandler");

const app = express();

app.use(express.json({ limit: "1mb" }));

app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/api/auth", authRoutes);
app.use("/api/news", newsRoutes);

app.use("/api/admin/news", adminNewsRoutes);
app.use("/api/files", fileRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;