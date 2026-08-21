import { CreateUser } from "../../type/types.js";
import { AppDataSource } from "../db-connection.js"
import { User } from "../entities/index.js"


export const userRepository = {
    getRepository(){
        return AppDataSource.getRepository(User);
    },

    async createUser(userData: CreateUser){
        const repo = this.getRepository();
        const user = repo.create(userData);
        return await repo.save(user);
    },

    async findByEmail(email: string){
        const repo = this.getRepository();
        return await repo.findOne({ where: { email } });
    }
}