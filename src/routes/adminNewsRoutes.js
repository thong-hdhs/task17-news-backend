const express = require("express");
const adminNewsController = require("../controllers/adminNewsController");
const adminAuth = require("../middleware/adminAuth");

const router = express.Router();

// Áp dụng middleware phân quyền cho mọi route dưới đây
router.use(adminAuth);

router.post("/", adminNewsController.createNews);
router.get("/", adminNewsController.getAdminNews);
router.put("/:id", adminNewsController.updateNews);
router.delete("/:id", adminNewsController.deleteNews);

module.exports = router;