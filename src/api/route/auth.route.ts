import { Router } from "express";
import { authController } from "../controller/auth.controller.js";
import { validateRegister, validateLogin } from "../validator/auth.validator.js";
import { authRateLimiter } from "../../middleware/rate-limiter.js";

const router = Router();

router.post("/register", authRateLimiter, validateRegister, authController.register);
router.post("/login", authRateLimiter, validateLogin, authController.login);

export default router;
