import { Router } from "express";
import { topicController } from "../controller/topic.controller.js";
import { validateCreateTopic } from "../validator/topic.validator.js";
import { authenticateRequest } from "../../middleware/authenticate-request.js";
import { authorizeRole } from "../../middleware/authorize-role.js";
import { topicMutationLimiter } from "../../middleware/rate-limiter.js";

const router = Router();

router.use(authenticateRequest);

router.post("/", topicMutationLimiter, authorizeRole("ADMIN"), validateCreateTopic, topicController.createTopic);
router.get("/", topicController.getAllTopics);
router.get("/:id/courses", topicController.getCoursesByTopic);

export default router;
