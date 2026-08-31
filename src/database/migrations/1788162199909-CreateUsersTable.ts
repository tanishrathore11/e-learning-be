import { MigrationInterface, QueryRunner } from "typeorm";
import bcrypt from "bcrypt";

export class CreateUsersTable1788162199909 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "users" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying(255) NOT NULL,
                "email" character varying(255) NOT NULL,
                "password" character varying(255) NOT NULL,
                "role" character varying(20) NOT NULL DEFAULT 'STUDENT',
                "bio" text,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                CONSTRAINT "UQ_users_email" UNIQUE ("email"),
                CONSTRAINT "PK_users_id" PRIMARY KEY ("id")
            )
        `);

        // Seed essential data
        const password = await bcrypt.hash("password123", 10);
        await queryRunner.query(`
            INSERT INTO "users" ("name", "email", "password", "role", "bio") VALUES
            ('Admin User', 'admin@elearn.com', $1, 'ADMIN', 'Platform administrator'),
            ('Alice Johnson', 'alice@elearn.com', $1, 'INSTRUCTOR', 'Full-stack developer with 10 years of experience'),
            ('Bob Smith', 'bob@elearn.com', $1, 'INSTRUCTOR', 'Data scientist and ML engineer')
        `, [password]);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "users"`);
    }
}
