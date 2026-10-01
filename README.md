# News Portal Backend

A Node.js, Express, and MongoDB backend implementing **Auth (A)** and **Public News (B)** only. Admin news management and file upload/delete APIs (C/D) are intentionally not included.

## Requirements

- Node.js 18 or later
- MongoDB running locally or a MongoDB connection string

## Setup

```bash
npm install
```

Copy `.env.example` to `.env`, then set `MONGO_URI` and replace `JWT_SECRET` with a long random secret. `PORT` defaults to `5000`; `JWT_EXPIRES_IN` defaults to `1d`.

Start MongoDB, then run:

```bash
npm run dev
```

For a normal run use `npm start`. The server connects to MongoDB before listening. Swagger UI is available at `http://localhost:5000/api-docs` (or the port configured in `.env`).

## API

All responses use `{ success, status, message, data }` for success and `{ success, status, message }` for errors.

### Auth

- `POST /api/auth/register` with `{ "username": "reader", "email": "reader@example.com", "password": "securePass123" }`. Passwords must contain at least 8 characters. New accounts always receive the `user` role.
- `POST /api/auth/login` with `{ "email": "reader@example.com", "password": "securePass123" }`. Returns a signed JWT and safe user details.

### Public news

- `GET /api/news?page=1&limit=10&keyword=example&sortBy=createdAt&order=desc`
- `GET /api/news/:id`

Public endpoints only return articles whose status is `published`. Supported `sortBy` values are `createdAt`, `updatedAt`, and `title`; order is `asc` or `desc`. The maximum page size is 100. List data contains `items` and `pagination` (`page`, `limit`, `total`, `totalPages`).

## Project layout

- `src/models`: Mongoose User and News models
- `src/controllers`: request behavior for auth and public news
- `src/routes`: API routes and Swagger annotations
- `src/middleware`: standard not-found and error responses
- `src/config`: MongoDB and Swagger configuration

There is no public registration path for creating administrators, and this project does not expose the admin or file APIs assigned to the other contributor.
