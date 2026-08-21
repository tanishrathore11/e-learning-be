import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Course, Enrollment, Lesson, Progress, PurchaseItem, Purchases, Topic, User } from './entities/index.js';
import { config } from '../config/env.js';

export const AppDataSource = new DataSource({
  type: 'postgres',

  host: config.databaseHost,
  port: Number(config.databasePort),
  username: config.databaseUser,
  password: config.databasePassword,
  database: config.databaseName,

  synchronize: false,
  logging: false,

  entities: [
    User,
    Course,
    Enrollment,
    Lesson,
    Progress,
    PurchaseItem,
    Purchases,
    Topic
  ],

  migrations: ["src/database/migrations/*.{ts,js}"],
});
