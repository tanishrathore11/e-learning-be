import { Router } from "express";
import { userController } from "../controller/user.controller.js";
import { validateUpdateUser } from "../validator/user.validator.js";
import { authenticateRequest } from "../../middleware/authenticate-request.js";

const router = Router();

router.use(authenticateRequest);

router.get("/me", userController.getUserProfile);
router.patch("/me", validateUpdateUser, userController.updateUserProfile);

export default router;
