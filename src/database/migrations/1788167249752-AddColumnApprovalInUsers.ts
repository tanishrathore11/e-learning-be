import { MigrationInterface, QueryRunner } from "typeorm";

export class AddColumnApprovalInUsers1788167249752 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "approval_status" character varying(20) NOT NULL DEFAULT 'APPROVED'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "approval_status"`);
    }
}
