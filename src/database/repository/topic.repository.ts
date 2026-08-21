import { CreateTopic } from "../../type/types.js";
import { AppDataSource } from "../db-connection.js"
import { Topic } from "../entities/index.js"


export const topicRepository = {
    getRepository(){
        return AppDataSource.getRepository(Topic)
    },

    async createTopic(topicData: CreateTopic){
        const repo = this.getRepository();
        const topic = repo.create(topicData);
        return await repo.save(topic);
    },
    async getAllTopic(){
        const repo = this.getRepository();
        return await repo.find();
    },
    async getTopicById(id: string){
        const repo = this.getRepository();
        return await repo.findOne({where: { id }});
    },
    async findTopicByName(name:string){
        const repo = this.getRepository();
        return await repo.findOne({ where: { name } });
    },
    async getCourseByTopicId(id:string){
        const repo = this.getRepository();
        return await repo.find({
            where: { id },
            relations: {
                courses: true
            }
        });
    },
}