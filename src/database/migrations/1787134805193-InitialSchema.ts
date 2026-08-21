import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1787134805193 implements MigrationInterface {
    name = 'InitialSchema1787134805193'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(255) NOT NULL, "email" character varying(255) NOT NULL, "password" character varying(255) NOT NULL, "role" character varying(20) NOT NULL DEFAULT 'STUDENT', "bio" text NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "topics" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(255) NOT NULL, "description" text NOT NULL, CONSTRAINT "PK_e4aa99a3fa60ec3a37d1fc4e853" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "courses" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying(255) NOT NULL, "description" text NOT NULL, "price" numeric(10,2) NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "topic_id" uuid NOT NULL, "instructor_id" uuid NOT NULL, CONSTRAINT "PK_3f70a487cc718ad8eda4e6d58c9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "idx_courses_instructor_id" ON "courses"  ("instructor_id") `);
        await queryRunner.query(`CREATE INDEX "idx_courses_topic_id" ON "courses"  ("topic_id") `);
        await queryRunner.query(`CREATE TABLE "lessons" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying(255) NOT NULL, "type" character varying NOT NULL DEFAULT 'NOTES', "content" text NOT NULL, "videoUrl" text NOT NULL, "position" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "course_id" uuid NOT NULL, CONSTRAINT "PK_9b9a8d455cac672d262d7275730" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "idx_lessons_course_position" ON "lessons"  ("course_id", "position") `);
        await queryRunner.query(`CREATE TABLE "enrollments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "user_id" uuid NOT NULL, "course_id" uuid NOT NULL, CONSTRAINT "uq_enrollments_user_course" UNIQUE ("user_id", "course_id"), CONSTRAINT "PK_7c0f752f9fb68bf6ed7367ab00f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "idx_enrollments_course_id" ON "enrollments"  ("course_id") `);
        await queryRunner.query(`CREATE TABLE "progress" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "completedLessons" integer NOT NULL DEFAULT '0', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "enrollment_id" uuid NOT NULL, CONSTRAINT "REL_e5d8a12a501224b5a6c2b71b1c" UNIQUE ("enrollment_id"), CONSTRAINT "PK_79abdfd87a688f9de756a162b6f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "purchases" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "totalAmount" numeric(10,2) NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "user_id" uuid NOT NULL, CONSTRAINT "PK_1d55032f37a34c6eceacbbca6b8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "idx_purchases_user" ON "purchases"  ("user_id") `);
        await queryRunner.query(`CREATE TABLE "purchase_items" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "amount" numeric(10,2) NOT NULL, "purchase_id" uuid NOT NULL, "course_id" uuid NOT NULL, CONSTRAINT "PK_e3d9bea880baad86ff6de3290da" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "idx_purchase_items_course_id" ON "purchase_items"  ("course_id") `);
        await queryRunner.query(`CREATE INDEX "idx_purchase_items_purchase_id" ON "purchase_items"  ("purchase_id") `);
        await queryRunner.query(`ALTER TABLE "courses" ADD CONSTRAINT "FK_b460373ff08936c854b013d014a" FOREIGN KEY ("topic_id") REFERENCES "topics"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "courses" ADD CONSTRAINT "FK_4fdc83dd6b261101401ec259342" FOREIGN KEY ("instructor_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "lessons" ADD CONSTRAINT "FK_3c4e299cf8ed04093935e2e22fe" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "enrollments" ADD CONSTRAINT "FK_ff997f5a39cd24a491b9aca45c9" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "enrollments" ADD CONSTRAINT "FK_b79d0bf01779fdf9cfb6b092af3" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "progress" ADD CONSTRAINT "FK_e5d8a12a501224b5a6c2b71b1c2" FOREIGN KEY ("enrollment_id") REFERENCES "enrollments"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "purchases" ADD CONSTRAINT "FK_024ddf7e04177a07fcb9806a90a" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
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
        await queryRunner.query(`DROP INDEX "public"."idx_purchase_items_purchase_id"`);
        await queryRunner.query(`DROP INDEX "public"."idx_purchase_items_course_id"`);
        await queryRunner.query(`DROP TABLE "purchase_items"`);
        await queryRunner.query(`DROP INDEX "public"."idx_purchases_user"`);
        await queryRunner.query(`DROP TABLE "purchases"`);
        await queryRunner.query(`DROP TABLE "progress"`);
        await queryRunner.query(`DROP INDEX "public"."idx_enrollments_course_id"`);
        await queryRunner.query(`DROP TABLE "enrollments"`);
        await queryRunner.query(`DROP INDEX "public"."idx_lessons_course_position"`);
        await queryRunner.query(`DROP TABLE "lessons"`);
        await queryRunner.query(`DROP INDEX "public"."idx_courses_topic_id"`);
        await queryRunner.query(`DROP INDEX "public"."idx_courses_instructor_id"`);
        await queryRunner.query(`DROP TABLE "courses"`);
        await queryRunner.query(`DROP TABLE "topics"`);
        await queryRunner.query(`DROP TABLE "users"`);
    }

}
