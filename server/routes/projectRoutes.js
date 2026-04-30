const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  createProject,
  getProjects,
  getProjectById,
  addMember,
  removeMember
} = require("../controllers/projectController");

router.post("/", authMiddleware, createProject);
router.get("/", authMiddleware, getProjects);
router.get("/:id", authMiddleware, getProjectById);
router.post("/:id/members", authMiddleware, addMember);
router.delete("/:id/members/:userId", authMiddleware, removeMember);

module.exports = router;