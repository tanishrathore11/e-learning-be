import { MigrationInterface, QueryRunner } from "typeorm";

export class CreatePurchaseItemsTable1788162206981 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "purchase_items" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "purchase_id" uuid,
                "course_id" uuid,
                "amount" numeric(10,2) NOT NULL,
                CONSTRAINT "PK_purchase_items_id" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`CREATE INDEX "idx_purchase_items_purchase_id" ON "purchase_items" ("purchase_id") `);
        await queryRunner.query(`CREATE INDEX "idx_purchase_items_course_id" ON "purchase_items" ("course_id") `);
        await queryRunner.query(`ALTER TABLE "purchase_items" ADD CONSTRAINT "FK_purchase_items_purchase_id" FOREIGN KEY ("purchase_id") REFERENCES "purchases"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "purchase_items" ADD CONSTRAINT "FK_purchase_items_course_id" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "purchase_items" DROP CONSTRAINT "FK_purchase_items_course_id"`);
        await queryRunner.query(`ALTER TABLE "purchase_items" DROP CONSTRAINT "FK_purchase_items_purchase_id"`);
        await queryRunner.query(`DROP INDEX "idx_purchase_items_course_id"`);
        await queryRunner.query(`DROP INDEX "idx_purchase_items_purchase_id"`);
        await queryRunner.query(`DROP TABLE "purchase_items"`);
    }
}
