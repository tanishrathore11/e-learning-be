import { MigrationInterface, QueryRunner } from "typeorm";

export class CreatePurchasesTable1788162205528 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "purchases" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "user_id" uuid,
                "totalAmount" numeric(10,2) NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_purchases_id" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`CREATE INDEX "idx_purchases_user" ON "purchases" ("user_id") `);
        await queryRunner.query(`ALTER TABLE "purchases" ADD CONSTRAINT "FK_purchases_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "purchases" DROP CONSTRAINT "FK_purchases_user_id"`);
        await queryRunner.query(`DROP INDEX "idx_purchases_user"`);
        await queryRunner.query(`DROP TABLE "purchases"`);
    }
}
