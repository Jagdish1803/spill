import express from "express";
import { login, logout, signup, updateProfile, updatePassword, checkAuth } from "../controllers/auth_controller.js";
import { protectRoute } from "../middleware/auth_middleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", protectRoute, logout);
router.put("/update-profile", protectRoute, updateProfile);
router.put("/update-password", protectRoute, updatePassword);
router.get("/check", protectRoute, checkAuth);

export default router;

//fixed