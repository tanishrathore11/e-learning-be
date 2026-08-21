import { AppDataSource } from "../db-connection.js";
import { Progress } from "../entities/Progress.entity.js";


export const lessonProgressRepository = {
    getRepository() {
        return AppDataSource.getRepository(Progress)
    },

    async getCompletedLessons(enrollmentId: string, courseId: string) {
        const repo = this.getRepository();

        return await repo.find({
            where: {
                enrollment: {
                    id: enrollmentId,
                },
                lesson: {
                    course: {
                        id: courseId,
                    },
                },
            },
            relations: {
                lesson: true,
            },
        });
    },
    async markLessonCompleted(enrollmentId: string, lessonId: string) {
        const repo = this.getRepository();

        const existingProgress = await repo.findOne({
            where: {
                enrollment: {
                    id: enrollmentId,
                },
                lesson: {
                    id: lessonId,
                },
            },
        });

        if (existingProgress) {
            return existingProgress;
        }

        const progress = repo.create({
            enrollment: {
                id: enrollmentId,
            },
            lesson: {
                id: lessonId,
            },
        });

        return await repo.save(progress);
    }

}