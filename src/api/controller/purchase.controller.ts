import { Request, Response, NextFunction } from "express";
import { purchaseService } from "../../service/purchase.service.js";

export const purchaseController = {
  async createPurchase(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // userId comes from JWT, not from body
      const purchase = await purchaseService.createPurchase(req.user!.id, req.body.items);
      res.status(201).json({ success: true, data: purchase });
    } catch (err) {
      next(err);
    }
  },

  async getMyPurchases(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const purchases = await purchaseService.getMyPurchases(req.user!.id);
      res.status(200).json({ success: true, data: purchases });
    } catch (err) {
      next(err);
    }
  },
};
