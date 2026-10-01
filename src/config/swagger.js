const swaggerJsdoc = require("swagger-jsdoc");
const path = require("path");

const options = {
    definition: {
        openapi: "3.0.3",
        info: {
            title: "News API",
            version: "1.0.0",
            description: "Authentication and public news endpoints. ",
        },
        servers: [
            {
                url: `http://localhost:${process.env.PORT || 5000}`,
                description: "Local server",
            },
        ],
        components: {
            schemas: {
                SuccessResponse: {
                    type: "object",
                    properties: {
                        success: { type: "boolean", example: true },
                        status: { type: "integer", example: 200 },
                        message: {
                            type: "string",
                            example: "Request successful",
                        },
                        data: { type: "object" },
                    },
                },
                ErrorResponse: {
                    type: "object",
                    properties: {
                        success: { type: "boolean", example: false },
                        status: { type: "integer", example: 400 },
                        message: { type: "string", example: "Invalid request" },
                    },
                },
                News: {
                    type: "object",
                    properties: {
                        _id: {
                            type: "string",
                            example: "65a123456789abcdef012345",
                        },
                        title: { type: "string", example: "Example news" },
                        content: {
                            type: "string",
                            example: "News article content",
                        },
                        thumbnail: {
                            type: "string",
                            example: "https://example.com/image.jpg",
                        },
                        status: {
                            type: "string",
                            enum: ["draft", "published"],
                        },
                        createdAt: { type: "string", format: "date-time" },
                        updatedAt: { type: "string", format: "date-time" },
                    },
                },
            },
        },
    },
    apis: [
        `${path.resolve(__dirname, "../routes").split(path.sep).join("/")}/*.js`,
    ],
};

module.exports = swaggerJsdoc(options);
