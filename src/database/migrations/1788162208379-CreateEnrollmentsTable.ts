import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateEnrollmentsTable1788162208379 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "enrollments" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "user_id" uuid,
                "course_id" uuid,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "uq_enrollments_user_course" UNIQUE ("user_id", "course_id"),
                CONSTRAINT "PK_enrollments_id" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`CREATE INDEX "idx_enrollments_course_id" ON "enrollments" ("course_id") `);
        await queryRunner.query(`ALTER TABLE "enrollments" ADD CONSTRAINT "FK_enrollments_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "enrollments" ADD CONSTRAINT "FK_enrollments_course_id" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "enrollments" DROP CONSTRAINT "FK_enrollments_course_id"`);
        await queryRunner.query(`ALTER TABLE "enrollments" DROP CONSTRAINT "FK_enrollments_user_id"`);
        await queryRunner.query(`DROP INDEX "idx_enrollments_course_id"`);
        await queryRunner.query(`DROP TABLE "enrollments"`);
    }
}
