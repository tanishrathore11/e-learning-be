import { Request, Response, NextFunction } from "express";
import { courseService } from "../../service/course.service.js";

export const courseController = {
  async createCourse(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // instructorId comes from JWT, not from body
      const data = { ...req.body, instructorId: req.user!.id };
      const course = await courseService.createCourse(data);
      res.status(201).json({ success: true, data: course });
    } catch (err) {
      next(err);
    }
  },

  async getAllCourses(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const courses = await courseService.getAllCourses();
      res.status(200).json({ success: true, data: courses });
    } catch (err) {
      next(err);
    }
  },

  async getCourseById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const course = await courseService.getCourseById(
        req.params.id as string,
        req.user!.id,
        req.user!.role
      );
      res.status(200).json({ success: true, data: course });
    } catch (err) {
      next(err);
    }
  },

  async updateCourse(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const course = await courseService.updateCourse(
        req.params.id as string,
        req.body,
        req.user!.id,
        req.user!.role
      );
      res.status(200).json({ success: true, data: course });
    } catch (err) {
      next(err);
    }
  },

  async deleteCourse(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await courseService.deleteCourse(
        req.params.id as string,
        req.user!.id,
        req.user!.role
      );
      res.status(200).json({ success: true, message: "Course deleted successfully" });
    } catch (err) {
      next(err);
    }
  },
};
