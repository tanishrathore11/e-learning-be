import { LessonData } from "../../type/types.js";
import { AppDataSource } from "../db-connection.js"
import { Lesson } from "../entities/index.js"


export const lessonRepository = {
    getRepository(){
        return AppDataSource.getRepository(Lesson);
    },

    async addLesson(lessonData: LessonData){
        const repo = this.getRepository();
        const lesson = repo.create({
            title: lessonData.title,
            type: lessonData.type,
            content: lessonData.type === "VIDEO" ? null : (lessonData.content ?? null),
            videoUrl: lessonData.type === "NOTES" ? null : (lessonData.videoUrl ?? null),
            position: lessonData.position,
            course: { id: lessonData.courseId },
        });

        return await repo.save(lesson);
    },
    async findLessonsByCourseId(courseId: string){
        const repo = this.getRepository();
        return await repo.find({
            where: { course: { id: courseId } },
            order: { position: "ASC" }
        });
    },
    async findById(id: string){
        const repo = this.getRepository();
        return await repo.findOne({
            where: { id },
            relations: { course: true }
        });
    },
    async updateLesson(id: string, data: Partial<LessonData>) {
        const repo = this.getRepository();
        const updateData: Record<string, any> = {};

        if (data.title !== undefined) updateData.title = data.title;
        if (data.type !== undefined) {
            updateData.type = data.type;
            if (data.type === "VIDEO") {
                updateData.content = null;
            } else if (data.type === "NOTES") {
                updateData.videoUrl = null;
            }
        }
        if (data.content !== undefined) updateData.content = data.content;
        if (data.videoUrl !== undefined) updateData.videoUrl = data.videoUrl;
        if (data.position !== undefined) updateData.position = data.position;
        if (data.courseId !== undefined) updateData.course = { id: data.courseId };

        await repo.update(id, updateData);
        return await repo.findOne({ where: { id } });
    },
    async deleteLesson(id: string){
        const repo = this.getRepository();
        return await repo.delete(id);
    }
}