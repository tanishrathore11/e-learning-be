import { Request, Response, NextFunction } from "express";
import { userService } from "../../service/user.service.js";

export const userController = {
  async getUserProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await userService.getUserProfile(req.user!.id);
      res.status(200).json({ success: true, data: user });
    } catch (err) {
      next(err);
    }
  },

  async updateUserProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await userService.updateUserProfile(req.user!.id, req.body);
      res.status(200).json({ success: true, data: user });
    } catch (err) {
      next(err);
    }
  }
};
