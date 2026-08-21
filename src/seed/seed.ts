import "reflect-metadata";
import bcrypt from "bcrypt";
import { AppDataSource } from "../database/db-connection.js";
import {
    User,
    Topic,
    Course,
    Lesson,
    Enrollment,
    Progress,
    Purchases,
    PurchaseItem,
} from "../database/entities/index.js";

async function seed() {
    await AppDataSource.initialize();
    console.log("✅ Database connected");

    const userRepo = AppDataSource.getRepository(User);
    const topicRepo = AppDataSource.getRepository(Topic);
    const courseRepo = AppDataSource.getRepository(Course);
    const lessonRepo = AppDataSource.getRepository(Lesson);
    const enrollmentRepo = AppDataSource.getRepository(Enrollment);
    const progressRepo = AppDataSource.getRepository(Progress);
    const purchaseRepo = AppDataSource.getRepository(Purchases);
    const purchaseItemRepo = AppDataSource.getRepository(PurchaseItem);

    // ─── Clean existing data (order matters due to FKs) ─────────────────────────
    await AppDataSource.query(`
        TRUNCATE TABLE
            progress,
            enrollments,
            purchase_items,
            purchases,
            lessons,
            courses,
            topics,
            users
        CASCADE
    `);
    console.log("🧹 Cleaned existing data");

    // ─── Users ───────────────────────────────────────────────────────────────────
    const password = await bcrypt.hash("password123", 10);

    const admin = userRepo.create({
        name: "Admin User",
        email: "admin@elearn.com",
        password,
        role: "ADMIN",
        bio: "Platform administrator",
    });

    const instructor1 = userRepo.create({
        name: "Alice Johnson",
        email: "alice@elearn.com",
        password,
        role: "INSTRUCTOR",
        bio: "Full-stack developer with 10 years of experience",
    });

    const instructor2 = userRepo.create({
        name: "Bob Smith",
        email: "bob@elearn.com",
        password,
        role: "INSTRUCTOR",
        bio: "Data scientist and ML engineer",
    });

    const student1 = userRepo.create({
        name: "Charlie Brown",
        email: "charlie@elearn.com",
        password,
        role: "STUDENT",
    });

    const student2 = userRepo.create({
        name: "Diana Prince",
        email: "diana@elearn.com",
        password,
        role: "STUDENT",
    });

    await userRepo.save([admin, instructor1, instructor2, student1, student2]);
    console.log("👤 Users seeded");

    // ─── Topics ──────────────────────────────────────────────────────────────────
    const webTopic = topicRepo.create({ name: "Web Development", description: "Frontend and backend web technologies" });
    const mlTopic = topicRepo.create({ name: "Machine Learning", description: "AI and ML fundamentals and applications" });
    const dbTopic = topicRepo.create({ name: "Databases", description: "SQL, NoSQL and data modelling" });

    await topicRepo.save([webTopic, mlTopic, dbTopic]);
    console.log("📚 Topics seeded");

    // ─── Courses ─────────────────────────────────────────────────────────────────
    const course1 = courseRepo.create({
        title: "Node.js & TypeScript Masterclass",
        description: "Build scalable REST APIs with Node.js, Express and TypeScript",
        topic: webTopic,
        instructor: instructor1,
        price: 49.99,
    });

    const course2 = courseRepo.create({
        title: "React from Zero to Hero",
        description: "Modern React with hooks, context and best practices",
        topic: webTopic,
        instructor: instructor1,
        price: 39.99,
    });

    const course3 = courseRepo.create({
        title: "Python for Machine Learning",
        description: "Hands-on ML with Python, scikit-learn and TensorFlow",
        topic: mlTopic,
        instructor: instructor2,
        price: 59.99,
    });

    const course4 = courseRepo.create({
        title: "PostgreSQL Deep Dive",
        description: "Advanced PostgreSQL: indexing, transactions and performance tuning",
        topic: dbTopic,
        instructor: instructor2,
        price: 34.99,
    });

    await courseRepo.save([course1, course2, course3, course4]);
    console.log("🎓 Courses seeded");

    // ─── Lessons ─────────────────────────────────────────────────────────────────
    const lessonsC1 = [
        { title: "Introduction to Node.js", type: "VIDEO" as const, videoUrl: "https://example.com/node-intro", position: 1, course: course1 },
        { title: "Setting up TypeScript", type: "VIDEO" as const, videoUrl: "https://example.com/ts-setup", position: 2, course: course1 },
        { title: "Building your first REST API", type: "VIDEO" as const, videoUrl: "https://example.com/first-api", position: 3, course: course1 },
        { title: "TypeScript cheat sheet", type: "NOTES" as const, content: "# TypeScript Cheat Sheet\n\nKey types: string, number, boolean...", position: 4, course: course1 },
    ];

    const lessonsC2 = [
        { title: "React Fundamentals", type: "VIDEO" as const, videoUrl: "https://example.com/react-fundamentals", position: 1, course: course2 },
        { title: "useState and useEffect", type: "VIDEO" as const, videoUrl: "https://example.com/hooks", position: 2, course: course2 },
        { title: "Hooks reference guide", type: "NOTES" as const, content: "# React Hooks Guide\n\nuseState, useEffect, useContext...", position: 3, course: course2 },
    ];

    const lessonsC3 = [
        { title: "Intro to Machine Learning", type: "VIDEO" as const, videoUrl: "https://example.com/ml-intro", position: 1, course: course3 },
        { title: "Linear Regression", type: "VIDEO" as const, videoUrl: "https://example.com/linear-regression", position: 2, course: course3 },
        { title: "ML concepts notes", type: "NOTES" as const, content: "# ML Key Concepts\n\nSupervised vs Unsupervised...", position: 3, course: course3 },
    ];

    const savedLessonsC1 = await lessonRepo.save(lessonRepo.create(lessonsC1));
    const savedLessonsC2 = await lessonRepo.save(lessonRepo.create(lessonsC2));
    const savedLessonsC3 = await lessonRepo.save(lessonRepo.create(lessonsC3));
    console.log("📖 Lessons seeded");

    // ─── Purchases & Enrollments ─────────────────────────────────────────────────
    // student1 buys course1 + course2
    const purchase1 = purchaseRepo.create({
        user: student1,
        totalAmount: course1.price + course2.price,
    });
    const savedPurchase1 = await purchaseRepo.save(purchase1);

    await purchaseItemRepo.save([
        purchaseItemRepo.create({ purchase: savedPurchase1, course: course1, amount: course1.price }),
        purchaseItemRepo.create({ purchase: savedPurchase1, course: course2, amount: course2.price }),
    ]);

    const enrollment1 = enrollmentRepo.create({ user: student1, course: course1 });
    const enrollment2 = enrollmentRepo.create({ user: student1, course: course2 });
    const [savedEnrollment1, savedEnrollment2] = await enrollmentRepo.save([enrollment1, enrollment2]);

    // student2 buys course3
    const purchase2 = purchaseRepo.create({
        user: student2,
        totalAmount: course3.price,
    });
    const savedPurchase2 = await purchaseRepo.save(purchase2);

    await purchaseItemRepo.save([
        purchaseItemRepo.create({ purchase: savedPurchase2, course: course3, amount: course3.price }),
    ]);

    const enrollment3 = enrollmentRepo.create({ user: student2, course: course3 });
    const [savedEnrollment3] = await enrollmentRepo.save([enrollment3]);

    console.log("🛒 Purchases & Enrollments seeded");

    // ─── Progress ────────────────────────────────────────────────────────────────
    // student1 completed first 2 lessons of course1
    await progressRepo.save([
        progressRepo.create({ enrollment: savedEnrollment1, lesson: savedLessonsC1[0] }),
        progressRepo.create({ enrollment: savedEnrollment1, lesson: savedLessonsC1[1] }),
    ]);

    // student2 completed first lesson of course3
    await progressRepo.save([
        progressRepo.create({ enrollment: savedEnrollment3, lesson: savedLessonsC3[0] }),
    ]);

    console.log("📊 Progress seeded");

    await AppDataSource.destroy();
    console.log("✅ Seed complete!");
}

seed().catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
});
