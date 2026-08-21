import { Router } from "express";
import { lessonController } from "../controller/lesson.controller.js";
import { validateAddLesson, validateUpdateLesson } from "../validator/lesson.validator.js";
import { authenticateRequest } from "../../middleware/authenticate-request.js";
import { authorizeRole } from "../../middleware/authorize-role.js";
import { lessonMutationLimiter } from "../../middleware/rate-limiter.js";

const router = Router();

router.use(authenticateRequest);

router.post("/", lessonMutationLimiter, authorizeRole("ADMIN", "INSTRUCTOR"), validateAddLesson, lessonController.addLesson);
router.patch("/:id", lessonMutationLimiter, authorizeRole("ADMIN", "INSTRUCTOR"), validateUpdateLesson, lessonController.updateLesson);
router.delete("/:id", lessonMutationLimiter, authorizeRole("ADMIN", "INSTRUCTOR"), lessonController.deleteLesson);

export default router;
