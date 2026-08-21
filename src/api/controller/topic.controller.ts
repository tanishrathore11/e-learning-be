import { Request, Response, NextFunction } from "express";
import { topicService } from "../../service/topic.service.js";

export const topicController = {
  async createTopic(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const topic = await topicService.createTopic(req.body);
      res.status(201).json({ success: true, data: topic });
    } catch (err) {
      next(err);
    }
  },

  async getAllTopics(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const topics = await topicService.getAllTopics();
      res.status(200).json({ success: true, data: topics });
    } catch (err) {
      next(err);
    }
  },

  async getCoursesByTopic(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const courses = await topicService.getCoursesByTopic(req.params.id as string);
      res.status(200).json({ success: true, data: courses });
    } catch (err) {
      next(err);
    }
  },
};
