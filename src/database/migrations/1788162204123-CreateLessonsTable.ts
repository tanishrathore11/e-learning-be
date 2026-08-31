import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateLessonsTable1788162204123 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "lessons" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "title" character varying(255) NOT NULL,
                "type" character varying(50) NOT NULL,
                "content" text,
                "video_url" character varying(255),
                "position" integer NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "course_id" uuid,
                CONSTRAINT "PK_lessons_id" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`ALTER TABLE "lessons" ADD CONSTRAINT "FK_lessons_course_id" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "lessons" DROP CONSTRAINT "FK_lessons_course_id"`);
        await queryRunner.query(`DROP TABLE "lessons"`);
    }
}
