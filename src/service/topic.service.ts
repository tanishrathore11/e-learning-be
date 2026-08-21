import { topicRepository } from "../database/repository/topic.repository.js";
import { AppError } from "../utils/appError.js";
import { CreateTopic } from "../type/types.js";

export const topicService = {
    async createTopic(data: CreateTopic) {
        const existing = await topicRepository.findTopicByName(data.name);
        if (existing) {
            throw new AppError(`Topic with name "${data.name}" already exists`, 409);
        }
        return await topicRepository.createTopic(data);
    },

    async getAllTopics() {
        return await topicRepository.getAllTopic();
    },

    async getCoursesByTopic(id: string) {
        // Verify topic exists first
        const topic = await topicRepository.getTopicById(id);
        if (!topic) {
            throw new AppError("Topic not found", 404);
        }
        return await topicRepository.getCourseByTopicId(id);
    },
};
