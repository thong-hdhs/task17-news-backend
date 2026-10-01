require("dotenv").config();

const app = require("./src/app");
const connectDatabase = require("./src/config/database");

const port = Number(process.env.PORT) || 5000;

async function start() {
    if (!process.env.MONGO_URI) {
        throw new Error("MONGO_URI is required");
    }
    if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is required");
    }

    await connectDatabase();
    app.listen(port, () => {
        console.log(`News API listening on port ${port}`);
    });
}

start().catch((error) => {
    console.error("Failed to start server:", error.message);
    process.exit(1);
});
