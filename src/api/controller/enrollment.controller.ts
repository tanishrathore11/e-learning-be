import { Request, Response, NextFunction } from "express";
import { enrollmentService } from "../../service/enrollment.service.js";

export const enrollmentController = {
  async getMyEnrollments(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const enrollments = await enrollmentService.getMyEnrollments(req.user!.id);
      res.status(200).json({ success: true, data: enrollments });
    } catch (err) {
      next(err);
    }
  },
};
