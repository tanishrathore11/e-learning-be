import { Router } from "express";
import { enrollmentController } from "../controller/enrollment.controller.js";
import { authenticateRequest } from "../../middleware/authenticate-request.js";
import { authorizeRole } from "../../middleware/authorize-role.js";

const router = Router();

router.use(authenticateRequest);

router.get("/me", authorizeRole("STUDENT"), enrollmentController.getMyEnrollments);

export default router;
