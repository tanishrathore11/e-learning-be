import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangesNotNullUse1787135860389 implements MigrationInterface {
    name = 'ChangesNotNullUse1787135860389'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "purchases" DROP CONSTRAINT "FK_024ddf7e04177a07fcb9806a90a"`);
        await queryRunner.query(`ALTER TABLE "courses" DROP CONSTRAINT "FK_b460373ff08936c854b013d014a"`);
        await queryRunner.query(`ALTER TABLE "courses" DROP CONSTRAINT "FK_4fdc83dd6b261101401ec259342"`);
        await queryRunner.query(`ALTER TABLE "courses" ALTER COLUMN "topic_id" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "courses" ALTER COLUMN "instructor_id" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "lessons" DROP CONSTRAINT "FK_3c4e299cf8ed04093935e2e22fe"`);
        await queryRunner.query(`DROP INDEX "public"."idx_lessons_course_position"`);
        await queryRunner.query(`ALTER TABLE "lessons" ALTER COLUMN "course_id" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "enrollments" DROP CONSTRAINT "FK_ff997f5a39cd24a491b9aca45c9"`);
        await queryRunner.query(`ALTER TABLE "enrollments" DROP CONSTRAINT "FK_b79d0bf01779fdf9cfb6b092af3"`);
        await queryRunner.query(`ALTER TABLE "enrollments" DROP CONSTRAINT "uq_enrollments_user_course"`);
        await queryRunner.query(`ALTER TABLE "enrollments" ALTER COLUMN "user_id" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "enrollments" ALTER COLUMN "course_id" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "progress" DROP CONSTRAINT "FK_e5d8a12a501224b5a6c2b71b1c2"`);
        await queryRunner.query(`ALTER TABLE "progress" ALTER COLUMN "enrollment_id" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "purchases" ALTER COLUMN "user_id" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "purchase_items" DROP CONSTRAINT "FK_607211d59b13e705a673a999ab5"`);
        await queryRunner.query(`ALTER TABLE "purchase_items" DROP CONSTRAINT "FK_4037e8ac7821cbe6e1c52d3d243"`);
        await queryRunner.query(`ALTER TABLE "purchase_items" ALTER COLUMN "purchase_id" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "purchase_items" ALTER COLUMN "course_id" DROP NOT NULL`);
        await queryRunner.query(`CREATE INDEX "idx_lessons_course_position" ON "lessons"  ("course_id", "position") `);
        await queryRunner.query(`ALTER TABLE "enrollments" ADD CONSTRAINT "uq_enrollments_user_course" UNIQUE ("user_id", "course_id")`);
        await queryRunner.query(`ALTER TABLE "courses" ADD CONSTRAINT "FK_b460373ff08936c854b013d014a" FOREIGN KEY ("topic_id") REFERENCES "topics"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "courses" ADD CONSTRAINT "FK_4fdc83dd6b261101401ec259342" FOREIGN KEY ("instructor_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "lessons" ADD CONSTRAINT "FK_3c4e299cf8ed04093935e2e22fe" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "enrollments" ADD CONSTRAINT "FK_ff997f5a39cd24a491b9aca45c9" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "enrollments" ADD CONSTRAINT "FK_b79d0bf01779fdf9cfb6b092af3" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "progress" ADD CONSTRAINT "FK_e5d8a12a501224b5a6c2b71b1c2" FOREIGN KEY ("enrollment_id") REFERENCES "enrollments"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "purchases" ADD CONSTRAINT "FK_024ddf7e04177a07fcb9806a90a" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "purchase_items" ADD CONSTRAINT "FK_607211d59b13e705a673a999ab5" FOREIGN KEY ("purchase_id") REFERENCES "purchases"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "purchase_items" ADD CONSTRAINT "FK_4037e8ac7821cbe6e1c52d3d243" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "purchase_items" DROP CONSTRAINT "FK_4037e8ac7821cbe6e1c52d3d243"`);
        await queryRunner.query(`ALTER TABLE "purchase_items" DROP CONSTRAINT "FK_607211d59b13e705a673a999ab5"`);
        await queryRunner.query(`ALTER TABLE "purchases" DROP CONSTRAINT "FK_024ddf7e04177a07fcb9806a90a"`);
        await queryRunner.query(`ALTER TABLE "progress" DROP CONSTRAINT "FK_e5d8a12a501224b5a6c2b71b1c2"`);
        await queryRunner.query(`ALTER TABLE "enrollments" DROP CONSTRAINT "FK_b79d0bf01779fdf9cfb6b092af3"`);
        await queryRunner.query(`ALTER TABLE "enrollments" DROP CONSTRAINT "FK_ff997f5a39cd24a491b9aca45c9"`);
        await queryRunner.query(`ALTER TABLE "lessons" DROP CONSTRAINT "FK_3c4e299cf8ed04093935e2e22fe"`);
        await queryRunner.query(`ALTER TABLE "courses" DROP CONSTRAINT "FK_4fdc83dd6b261101401ec259342"`);
        await queryRunner.query(`ALTER TABLE "courses" DROP CONSTRAINT "FK_b460373ff08936c854b013d014a"`);
        await queryRunner.query(`ALTER TABLE "enrollments" DROP CONSTRAINT "uq_enrollments_user_course"`);
        await queryRunner.query(`DROP INDEX "public"."idx_lessons_course_position"`);
        await queryRunner.query(`ALTER TABLE "purchase_items" ALTER COLUMN "course_id" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "purchase_items" ALTER COLUMN "purchase_id" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "purchase_items" ADD CONSTRAINT "FK_4037e8ac7821cbe6e1c52d3d243" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "purchase_items" ADD CONSTRAINT "FK_607211d59b13e705a673a999ab5" FOREIGN KEY ("purchase_id") REFERENCES "purchases"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "purchases" ALTER COLUMN "user_id" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "progress" ALTER COLUMN "enrollment_id" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "progress" ADD CONSTRAINT "FK_e5d8a12a501224b5a6c2b71b1c2" FOREIGN KEY ("enrollment_id") REFERENCES "enrollments"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "enrollments" ALTER COLUMN "course_id" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "enrollments" ALTER COLUMN "user_id" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "enrollments" ADD CONSTRAINT "uq_enrollments_user_course" UNIQUE ("user_id", "course_id")`);
        await queryRunner.query(`ALTER TABLE "enrollments" ADD CONSTRAINT "FK_b79d0bf01779fdf9cfb6b092af3" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "enrollments" ADD CONSTRAINT "FK_ff997f5a39cd24a491b9aca45c9" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "lessons" ALTER COLUMN "course_id" SET NOT NULL`);
        await queryRunner.query(`CREATE INDEX "idx_lessons_course_position" ON "lessons" USING btree ("position", "course_id") `);
        await queryRunner.query(`ALTER TABLE "lessons" ADD CONSTRAINT "FK_3c4e299cf8ed04093935e2e22fe" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "courses" ALTER COLUMN "instructor_id" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "courses" ALTER COLUMN "topic_id" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "courses" ADD CONSTRAINT "FK_4fdc83dd6b261101401ec259342" FOREIGN KEY ("instructor_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "courses" ADD CONSTRAINT "FK_b460373ff08936c854b013d014a" FOREIGN KEY ("topic_id") REFERENCES "topics"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "purchases" ADD CONSTRAINT "FK_024ddf7e04177a07fcb9806a90a" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
