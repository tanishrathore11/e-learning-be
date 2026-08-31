import { Router } from "express";
import { adminController } from "../controller/admin.controller.js";
import { authenticateRequest } from "../../middleware/authenticate-request.js";
import { authorizeRole } from "../../middleware/authorize-role.js";

const router = Router();

router.get(
  "/instructors/pending",
  authenticateRequest,
  authorizeRole("ADMIN"),
  adminController.getPendingInstructors
);

router.patch(
  "/instructors/:userId/approve",
  authenticateRequest,
  authorizeRole("ADMIN"),
  adminController.approveInstructorById
);

router.patch(
  "/instructors/:userId/reject",
  authenticateRequest,
  authorizeRole("ADMIN"),
  adminController.rejectInstructorById
);

router.post(
  "/instructors/approve",
  authenticateRequest,
  authorizeRole("ADMIN"),
  adminController.approveInstructor
);

export default router;
