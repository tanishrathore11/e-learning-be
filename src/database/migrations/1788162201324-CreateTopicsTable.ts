import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTopicsTable1788162201324 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "topics" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying(255) NOT NULL,
                "description" text,
                CONSTRAINT "PK_topics_id" PRIMARY KEY ("id")
            )
        `);

        await queryRunner.query(`
            INSERT INTO "topics" ("name", "description") VALUES
            ('Web Development', 'Frontend and backend web technologies'),
            ('Machine Learning', 'AI and ML fundamentals and applications'),
            ('Databases', 'SQL, NoSQL and data modelling')
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "topics"`);
    }
}
