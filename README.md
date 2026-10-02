# News Portal Backend

Backend cho hệ thống quản lý và đọc tin tức, được xây dựng bằng Node.js, Express.js, MongoDB và Mongoose. Dự án gồm các chức năng đăng ký/đăng nhập, đọc tin công khai, quản trị bài viết và upload/xóa file dành cho admin.

## Yêu cầu môi trường

- Node.js 18 trở lên
- MongoDB local hoặc MongoDB Atlas có connection string hợp lệ
- npm

## Cài đặt và chạy

```bash
npm install
```

Tạo file `.env` từ `.env.example`, sau đó cấu hình các biến môi trường:

| Biến             | Ý nghĩa                                          | Mặc định                     |
| ---------------- | ------------------------------------------------ | ---------------------------- |
| `PORT`           | Port chạy HTTP server                            | `5000`                       |
| `MONGO_URI`      | MongoDB connection string                        | MongoDB local trong file mẫu |
| `JWT_SECRET`     | Secret dùng để ký JWT; không chia sẻ hoặc commit | Không có                     |
| `JWT_EXPIRES_IN` | Thời hạn của JWT                                 | `1d`                         |
| `UPLOAD_DIR`     | Thư mục lưu file upload trên máy chủ             | `./uploads`                  |

Khởi động MongoDB, rồi chạy development server:

```bash
npm run dev
```

Chạy production-style bằng lệnh:

```bash
npm start
```

Server kết nối MongoDB trước khi bắt đầu lắng nghe request. Swagger UI được mở tại `http://localhost:<PORT>/api-docs`.

## Xác thực và phân quyền

Đăng ký bằng `POST /api/auth/register` với request body gồm `username`, `email`, `password`. Password được hash bằng bcrypt; tài khoản mới luôn có role `user`. Đăng nhập bằng `POST /api/auth/login` với `email` và `password`; response trả về JWT.

Các admin endpoint yêu cầu header `Authorization: Bearer <token>` và JWT phải thuộc tài khoản có role `admin`. Không thể tạo admin qua API đăng ký công khai. Để cấp quyền admin, dùng công cụ quản trị MongoDB đáng tin cậy và chạy lệnh sau trên database của dự án:

```javascript
db.users.updateOne({ email: "admin@example.com" }, { $set: { role: "admin" } });
```

Không đưa `.env`, MongoDB credentials hoặc `JWT_SECRET` lên GitHub. Nếu secret đã bị lộ, hãy đổi secret/password tương ứng và khởi động lại server.

## Quy ước response

Response thành công có dạng:

```json
{
    "success": true,
    "status": 200,
    "message": "Request successful",
    "data": {}
}
```

Response lỗi có dạng:

```json
{
    "success": false,
    "status": 400,
    "message": "Invalid request"
}
```

`status` trong response luôn tương ứng với HTTP status code.

## API endpoints

### Auth

| Method | Endpoint             | Mô tả                     |
| ------ | -------------------- | ------------------------- |
| `POST` | `/api/auth/register` | Tạo tài khoản role `user` |
| `POST` | `/api/auth/login`    | Đăng nhập và nhận JWT     |

Request body đăng ký mẫu:

```json
{
    "username": "reader",
    "email": "reader@example.com",
    "password": "securePass123"
}
```

### Public News

| Method | Endpoint        | Mô tả                          |
| ------ | --------------- | ------------------------------ |
| `GET`  | `/api/news`     | Danh sách bài viết đã xuất bản |
| `GET`  | `/api/news/:id` | Chi tiết bài viết đã xuất bản  |

Ví dụ query hỗ trợ pagination, search và sorting:

```text
GET /api/news?page=1&limit=10&keyword=example&sortBy=createdAt&order=desc
```

`page` bắt đầu từ `1`; `limit` từ `1` đến `100`. `sortBy` nhận `createdAt`, `updatedAt` hoặc `title`; `order` nhận `asc` hoặc `desc`. Search theo `keyword` không phân biệt chữ hoa/chữ thường và tìm trong title/content. Public API chỉ trả bài có `status: "published"`.

### Admin News

Tất cả endpoint trong nhóm này yêu cầu JWT của admin.

| Method   | Endpoint              | Mô tả                                           |
| -------- | --------------------- | ----------------------------------------------- |
| `POST`   | `/api/admin/news`     | Tạo bài viết                                    |
| `GET`    | `/api/admin/news`     | Tìm kiếm, sorting và pagination trên mọi status |
| `PUT`    | `/api/admin/news/:id` | Cập nhật bài viết theo MongoDB `_id`            |
| `DELETE` | `/api/admin/news/:id` | Xóa bài viết theo MongoDB `_id`                 |

Request body tạo bài viết:

```json
{
    "title": "Tiêu đề bài viết",
    "content": "Nội dung bài viết",
    "thumbnail": "https://example.com/news-image.jpg",
    "status": "published"
}
```

`title`, `content`, `thumbnail` là bắt buộc khi tạo. `status` nhận `draft` hoặc `published`, mặc định là `published`. Khi update, có thể gửi một hoặc nhiều trường được phép thay đổi. MongoDB tự tạo `_id`; lấy giá trị này từ response tạo bài hoặc từ `data.items` của endpoint danh sách rồi dùng cho `PUT`/`DELETE`.

### Admin Files

Tất cả endpoint trong nhóm này yêu cầu JWT của admin.

| Method   | Endpoint                  | Mô tả                                                     |
| -------- | ------------------------- | --------------------------------------------------------- |
| `POST`   | `/api/admin/files/upload` | Upload file bằng `multipart/form-data`, field tên `file`  |
| `DELETE` | `/api/admin/files`        | Xóa file đã upload bằng `fileUrl`, `path` hoặc `filename` |

File được lưu local trong `UPLOAD_DIR` (mặc định `./uploads`), giới hạn dung lượng `10 MB`, và được truy cập công khai qua `/uploads/<filename>`. Tên file được server tạo mới. Response upload trả `data.fileUrl`; khi xóa, gửi giá trị đó trong JSON body, ví dụ:

```json
{
    "fileUrl": "http://localhost:5000/uploads/<filename>"
}
```

## Swagger UI

Mở `http://localhost:<PORT>/api-docs` để xem và gửi request thử nghiệm. Với admin endpoint, chọn **Authorize** và nhập Bearer token của admin trước khi thực hiện request.

## Kiểm tra cú pháp

```bash
npm run check
```

Lệnh trên chạy `node --check` cho `server.js` và `src/app.js`.

## Cấu trúc dự án

```text
src/
	config/       Cấu hình MongoDB, Swagger và upload directory
	controllers/  Xử lý request/response cho từng nhóm API
	middleware/   Authentication, authorization và error handling
	models/       Mongoose models cho User và News
	routes/       Khai báo endpoint và Swagger documentation
	utils/        HTTP response/error helpers
```
