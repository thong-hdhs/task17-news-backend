// src/routes/fileRoutes.js
const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const adminAuth = require('../middleware/adminAuth');

const router = express.Router();

// Cấu hình Multer lưu file vào thư mục 'uploads'
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = './uploads';
        if (!fs.existsSync(dir)) fs.mkdirSync(dir);
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage });

// API Upload File
router.post('/upload', adminAuth, upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, status: 400, message: "Chưa chọn file" });
    }
    res.status(201).json({ 
        success: true, 
        status: 201, 
        message: "Upload thành công", 
        data: { url: `/uploads/${req.file.filename}` } 
    });
});

// API Xóa File
router.delete('/:filename', adminAuth, (req, res) => {
    const filePath = path.join(__dirname, '../../uploads', req.params.filename);
    fs.unlink(filePath, (err) => {
        if (err) {
            return res.status(404).json({ success: false, status: 404, message: "File không tồn tại hoặc lỗi hệ thống" });
        }
        res.status(200).json({ success: true, status: 200, message: "Xóa file thành công", data: null });
    });
});

module.exports = router;