import { Request, Response, NextFunction } from "express";
import { adminService } from "../../service/admin.service.js";

export const adminController = {
  async approveInstructor(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token } = req.body;
      const user = await adminService.approveInstructor(token);
      res.status(200).json({ success: true, data: user });
    } catch (err) {
      next(err);
    }
  },
};
