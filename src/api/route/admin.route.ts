import { Router } from "express";
import { adminController } from "../controller/admin.controller.js";
import { authenticateRequest } from "../../middleware/authenticate-request.js";
import { authorizeRole } from "../../middleware/authorize-role.js";

const router = Router();

router.post(
  "/instructors/approve",
  authenticateRequest,
  authorizeRole("ADMIN"),
  adminController.approveInstructor
);

export default router;
