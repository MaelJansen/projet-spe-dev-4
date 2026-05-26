import { MigrationInterface, QueryRunner } from "typeorm";

export class AddColumnForUser1779793096837 implements MigrationInterface {
    name = 'AddColumnForUser1779793096837'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`two_factor_authentication_secret\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`is_two_factor_authentication_enabled\` tinyint NOT NULL DEFAULT 0`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`is_two_factor_authentication_enabled\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`two_factor_authentication_secret\``);
    }

}
