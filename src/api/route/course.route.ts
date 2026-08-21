import { Router } from "express";
import { courseController } from "../controller/course.controller.js";
import { validateCreateCourse, validateUpdateCourse } from "../validator/course.validator.js";
import { authenticateRequest } from "../../middleware/authenticate-request.js";
import { authorizeRole } from "../../middleware/authorize-role.js";
import { courseMutationLimiter } from "../../middleware/rate-limiter.js";

const router = Router();

router.use(authenticateRequest);

router.post("/", courseMutationLimiter, authorizeRole("ADMIN", "INSTRUCTOR"), validateCreateCourse, courseController.createCourse);
router.get("/", courseController.getAllCourses);
router.get("/:id", courseController.getCourseById);
router.patch("/:id", courseMutationLimiter, authorizeRole("ADMIN", "INSTRUCTOR"), validateUpdateCourse, courseController.updateCourse);
router.delete("/:id", courseMutationLimiter, authorizeRole("ADMIN", "INSTRUCTOR"), courseController.deleteCourse);

export default router;
