import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangedToNull1787141441260 implements MigrationInterface {
    name = 'ChangedToNull1787141441260'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "bio" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "topics" ALTER COLUMN "description" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "courses" ALTER COLUMN "description" DROP NOT NULL`);
        await queryRunner.query(`DROP INDEX "public"."idx_lessons_course_position"`);
        await queryRunner.query(`ALTER TABLE "lessons" ALTER COLUMN "content" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "lessons" ALTER COLUMN "videoUrl" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "lessons" ALTER COLUMN "position" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "progress" ALTER COLUMN "completedLessons" DROP NOT NULL`);
        await queryRunner.query(`CREATE INDEX "idx_lessons_course_position" ON "lessons"  ("course_id", "position") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."idx_lessons_course_position"`);
        await queryRunner.query(`ALTER TABLE "progress" ALTER COLUMN "completedLessons" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "lessons" ALTER COLUMN "position" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "lessons" ALTER COLUMN "videoUrl" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "lessons" ALTER COLUMN "content" SET NOT NULL`);
        await queryRunner.query(`CREATE INDEX "idx_lessons_course_position" ON "lessons" USING btree ("position", "course_id") `);
        await queryRunner.query(`ALTER TABLE "courses" ALTER COLUMN "description" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "topics" ALTER COLUMN "description" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "bio" SET NOT NULL`);
    }

}
