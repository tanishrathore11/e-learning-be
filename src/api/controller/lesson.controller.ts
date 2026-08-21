import { Request, Response, NextFunction } from "express";
import { lessonService } from "../../service/lesson.service.js";

export const lessonController = {
  async addLesson(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const lesson = await lessonService.addLesson(
        req.body,
        req.user!.id,
        req.user!.role
      );
      res.status(201).json({ success: true, data: lesson });
    } catch (err) {
      next(err);
    }
  },

  async updateLesson(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const lesson = await lessonService.updateLesson(
        req.params.id as string,
        req.body,
        req.user!.id,
        req.user!.role
      );
      res.status(200).json({ success: true, data: lesson });
    } catch (err) {
      next(err);
    }
  },

  async deleteLesson(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await lessonService.deleteLesson(
        req.params.id as string,
        req.user!.id,
        req.user!.role
      );
      res.status(200).json({ success: true, message: "Lesson deleted successfully" });
    } catch (err) {
      next(err);
    }
  },
};
