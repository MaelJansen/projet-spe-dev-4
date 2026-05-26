import { MigrationInterface, QueryRunner } from "typeorm";

export class AddColumnForUser1779790742219 implements MigrationInterface {
    name = 'AddColumnForUser1779790742219'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`hashed_refresh_token\` varchar(255) NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`hashed_refresh_token\``);
    }

}
