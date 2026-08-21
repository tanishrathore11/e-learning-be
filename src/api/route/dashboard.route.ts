import { Router } from "express";
import { dashboardController } from "../controller/dashboard.controller.js";
import { validateMarkProgress } from "../validator/enrollment.validator.js";
import { authenticateRequest } from "../../middleware/authenticate-request.js";
import { authorizeRole } from "../../middleware/authorize-role.js";
import { progressRateLimiter } from "../../middleware/rate-limiter.js";

const router = Router();

router.use(authenticateRequest);

router.get("/instructor", authorizeRole("INSTRUCTOR", "ADMIN"), dashboardController.getInstructorDashboard);
router.get("/student", authorizeRole("STUDENT"), dashboardController.getStudentDashboard);
router.post("/progress", progressRateLimiter, authorizeRole("STUDENT"), validateMarkProgress, dashboardController.markLessonCompleted);

export default router;
