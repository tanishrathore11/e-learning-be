import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdatedProgressTable1787213695251 implements MigrationInterface {
    name = 'UpdatedProgressTable1787213695251'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "progress" DROP COLUMN "completedLessons"`);
        await queryRunner.query(`ALTER TABLE "progress" ADD "lesson_id" uuid`);
        await queryRunner.query(`ALTER TABLE "progress" DROP CONSTRAINT "FK_e5d8a12a501224b5a6c2b71b1c2"`);
        await queryRunner.query(`ALTER TABLE "progress" DROP CONSTRAINT "REL_e5d8a12a501224b5a6c2b71b1c"`);
        await queryRunner.query(`ALTER TABLE "progress" ADD CONSTRAINT "uq_progress_enrollment_lesson" UNIQUE ("enrollment_id", "lesson_id")`);
        await queryRunner.query(`ALTER TABLE "progress" ADD CONSTRAINT "FK_e5d8a12a501224b5a6c2b71b1c2" FOREIGN KEY ("enrollment_id") REFERENCES "enrollments"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "progress" ADD CONSTRAINT "FK_ef62be61a6c4f69d0570bb5cc35" FOREIGN KEY ("lesson_id") REFERENCES "lessons"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "progress" DROP CONSTRAINT "FK_ef62be61a6c4f69d0570bb5cc35"`);
        await queryRunner.query(`ALTER TABLE "progress" DROP CONSTRAINT "FK_e5d8a12a501224b5a6c2b71b1c2"`);
        await queryRunner.query(`ALTER TABLE "progress" DROP CONSTRAINT "uq_progress_enrollment_lesson"`);
        await queryRunner.query(`ALTER TABLE "progress" ADD CONSTRAINT "REL_e5d8a12a501224b5a6c2b71b1c" UNIQUE ("enrollment_id")`);
        await queryRunner.query(`ALTER TABLE "progress" ADD CONSTRAINT "FK_e5d8a12a501224b5a6c2b71b1c2" FOREIGN KEY ("enrollment_id") REFERENCES "enrollments"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "progress" DROP COLUMN "lesson_id"`);
        await queryRunner.query(`ALTER TABLE "progress" ADD "completedLessons" integer DEFAULT '0'`);
    }

}
