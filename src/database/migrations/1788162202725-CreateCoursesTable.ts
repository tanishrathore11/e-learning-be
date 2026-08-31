import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateCoursesTable1788162202725 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "courses" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "title" character varying(255) NOT NULL,
                "description" text,
                "price" numeric(10,2) NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "topic_id" uuid,
                "instructor_id" uuid,
                CONSTRAINT "PK_courses_id" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`CREATE INDEX "idx_courses_topic_id" ON "courses" ("topic_id") `);
        await queryRunner.query(`CREATE INDEX "idx_courses_instructor_id" ON "courses" ("instructor_id") `);
        await queryRunner.query(`ALTER TABLE "courses" ADD CONSTRAINT "FK_courses_topic_id" FOREIGN KEY ("topic_id") REFERENCES "topics"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "courses" ADD CONSTRAINT "FK_courses_instructor_id" FOREIGN KEY ("instructor_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "courses" DROP CONSTRAINT "FK_courses_instructor_id"`);
        await queryRunner.query(`ALTER TABLE "courses" DROP CONSTRAINT "FK_courses_topic_id"`);
        await queryRunner.query(`DROP INDEX "idx_courses_instructor_id"`);
        await queryRunner.query(`DROP INDEX "idx_courses_topic_id"`);
        await queryRunner.query(`DROP TABLE "courses"`);
    }
}
