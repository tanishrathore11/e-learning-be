import { Request, Response, NextFunction } from "express";
import { dashboardService } from "../../service/dashboard.service.js";

export const dashboardController = {
  async getAdminDashboard(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dashboard = await dashboardService.getAdminDashboard();
      res.status(200).json({ success: true, data: dashboard });
    } catch (err) {
      next(err);
    }
  },

  async getInstructorDashboard(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dashboard = await dashboardService.getInstructorDashboard(req.user!.id);
      res.status(200).json({ success: true, data: dashboard });
    } catch (err) {
      next(err);
    }
  },

  async getStudentDashboard(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dashboard = await dashboardService.getStudentDashboard(req.user!.id);
      res.status(200).json({ success: true, data: dashboard });
    } catch (err) {
      next(err);
    }
  },

  async markLessonCompleted(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { enrollmentId, lessonId } = req.body;
      const progress = await dashboardService.markLessonCompleted(enrollmentId, lessonId);
      res.status(201).json({ success: true, data: progress });
    } catch (err) {
      next(err);
    }
  },

  async removeLessonCompleted(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { enrollmentId, lessonId } = req.body;
      await dashboardService.removeLessonCompleted(enrollmentId, lessonId);
      res.status(200).json({ success: true, message: "Progress deleted successfully" });
    } catch (err) {
      next(err);
    }
  },
};
