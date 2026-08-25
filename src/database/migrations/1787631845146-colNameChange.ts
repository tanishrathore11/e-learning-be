import { MigrationInterface, QueryRunner } from "typeorm";

export class ColNameChange1787631845146 implements MigrationInterface {
    name = 'ColNameChange1787631845146'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "createdAt"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "updatedAt"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "deletedAt"`);
        await queryRunner.query(`ALTER TABLE "courses" DROP COLUMN "createdAt"`);
        await queryRunner.query(`ALTER TABLE "courses" DROP COLUMN "updatedAt"`);
        await queryRunner.query(`ALTER TABLE "lessons" DROP COLUMN "videoUrl"`);
        await queryRunner.query(`ALTER TABLE "lessons" DROP COLUMN "createdAt"`);
        await queryRunner.query(`ALTER TABLE "lessons" DROP COLUMN "updatedAt"`);
        await queryRunner.query(`ALTER TABLE "enrollments" DROP COLUMN "createdAt"`);
        await queryRunner.query(`ALTER TABLE "enrollments" DROP COLUMN "updatedAt"`);
        await queryRunner.query(`ALTER TABLE "progress" DROP COLUMN "createdAt"`);
        await queryRunner.query(`ALTER TABLE "progress" DROP COLUMN "updatedAt"`);
        await queryRunner.query(`ALTER TABLE "purchases" DROP COLUMN "createdAt"`);
        await queryRunner.query(`ALTER TABLE "purchases" DROP COLUMN "updatedAt"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "users" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "users" ADD "deleted_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "courses" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "courses" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "lessons" ADD "video_url" text`);
        await queryRunner.query(`ALTER TABLE "lessons" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "lessons" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "enrollments" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "enrollments" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "progress" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "progress" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "purchases" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "purchases" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "purchases" DROP COLUMN "updated_at"`);
        await queryRunner.query(`ALTER TABLE "purchases" DROP COLUMN "created_at"`);
        await queryRunner.query(`ALTER TABLE "progress" DROP COLUMN "updated_at"`);
        await queryRunner.query(`ALTER TABLE "progress" DROP COLUMN "created_at"`);
        await queryRunner.query(`ALTER TABLE "enrollments" DROP COLUMN "updated_at"`);
        await queryRunner.query(`ALTER TABLE "enrollments" DROP COLUMN "created_at"`);
        await queryRunner.query(`ALTER TABLE "lessons" DROP COLUMN "updated_at"`);
        await queryRunner.query(`ALTER TABLE "lessons" DROP COLUMN "created_at"`);
        await queryRunner.query(`ALTER TABLE "lessons" DROP COLUMN "video_url"`);
        await queryRunner.query(`ALTER TABLE "courses" DROP COLUMN "updated_at"`);
        await queryRunner.query(`ALTER TABLE "courses" DROP COLUMN "created_at"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "updated_at"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "created_at"`);
        await queryRunner.query(`ALTER TABLE "purchases" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "purchases" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "progress" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "progress" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "enrollments" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "enrollments" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "lessons" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "lessons" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "lessons" ADD "videoUrl" text`);
        await queryRunner.query(`ALTER TABLE "courses" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "courses" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "users" ADD "deletedAt" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "users" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "users" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`);
    }

}
