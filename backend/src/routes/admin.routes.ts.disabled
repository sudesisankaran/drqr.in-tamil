import express from "express";
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from "../controllers/admin.controller";
import { protect, authorize } from "../middleware/auth.middleware";

const router = express.Router();

router.use(protect, authorize("admin"));

router.post("/users-role", getAllUsers);
router.get("/users/:id", getUserById);
router.post("/users", createUser);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);

export default router;