import { Request, Response, NextFunction } from "express";
import { adminService } from "../../service/admin.service.js";

export const adminController = {
  async getPendingInstructors(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await adminService.getPendingInstructors();
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async approveInstructorById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.params.userId as string;
      const user = await adminService.approveInstructorById(userId);
      res.status(200).json({ success: true, data: user, message: "Instructor approved successfully." });
    } catch (err) {
      next(err);
    }
  },

  async rejectInstructorById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.params.userId as string;
      const user = await adminService.rejectInstructorById(userId);
      res.status(200).json({ success: true, data: user, message: "Instructor request rejected." });
    } catch (err) {
      next(err);
    }
  },

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
