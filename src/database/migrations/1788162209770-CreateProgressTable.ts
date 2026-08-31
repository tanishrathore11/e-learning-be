import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateProgressTable1788162209770 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "progress" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "enrollment_id" uuid,
                "lesson_id" uuid,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "uq_progress_enrollment_lesson" UNIQUE ("enrollment_id", "lesson_id"),
                CONSTRAINT "PK_progress_id" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`ALTER TABLE "progress" ADD CONSTRAINT "FK_progress_enrollment_id" FOREIGN KEY ("enrollment_id") REFERENCES "enrollments"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "progress" ADD CONSTRAINT "FK_progress_lesson_id" FOREIGN KEY ("lesson_id") REFERENCES "lessons"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "progress" DROP CONSTRAINT "FK_progress_lesson_id"`);
        await queryRunner.query(`ALTER TABLE "progress" DROP CONSTRAINT "FK_progress_enrollment_id"`);
        await queryRunner.query(`DROP TABLE "progress"`);
    }
}
