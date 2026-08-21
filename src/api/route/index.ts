import { Router } from "express";
import authRoutes from "./auth.route.js";
import topicRoutes from "./topic.route.js";
import courseRoutes from "./course.route.js";
import lessonRoutes from "./lesson.route.js";
import enrollmentRoutes from "./enrollment.route.js";
import purchaseRoutes from "./purchase.route.js";
import dashboardRoutes from "./dashboard.route.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/topics", topicRoutes);
router.use("/courses", courseRoutes);
router.use("/lessons", lessonRoutes);
router.use("/enrollments", enrollmentRoutes);
router.use("/purchases", purchaseRoutes);
router.use("/dashboard", dashboardRoutes);

export default router;
