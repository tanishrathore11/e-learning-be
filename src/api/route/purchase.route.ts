import { Router } from "express";
import { purchaseController } from "../controller/purchase.controller.js";
import { validateCreatePurchase } from "../validator/enrollment.validator.js";
import { authenticateRequest } from "../../middleware/authenticate-request.js";
import { authorizeRole } from "../../middleware/authorize-role.js";
import { purchaseRateLimiter } from "../../middleware/rate-limiter.js";

const router = Router();

router.use(authenticateRequest);

router.post("/", purchaseRateLimiter, authorizeRole("STUDENT"), validateCreatePurchase, purchaseController.createPurchase);
router.get("/me", authorizeRole("STUDENT"), purchaseController.getMyPurchases);

export default router;
