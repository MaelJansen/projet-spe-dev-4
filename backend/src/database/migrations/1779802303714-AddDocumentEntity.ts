import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDocumentEntity1779802303714 implements MigrationInterface {
    name = 'AddDocumentEntity1779802303714'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`documents\` (\`id\` varchar(36) NOT NULL, \`name\` varchar(255) NOT NULL, \`type\` enum ('FOLDER', 'TEXT_DOC', 'IMPORTED_FILE') NOT NULL, \`content\` text NULL, \`file_url\` varchar(500) NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, \`parent_folder\` varchar(36) NULL, \`created_by\` varchar(36) NOT NULL, \`last_modified_by\` varchar(36) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`documents\` ADD CONSTRAINT \`FK_6d5e50a920a122baac332ce8533\` FOREIGN KEY (\`parent_folder\`) REFERENCES \`documents\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`documents\` ADD CONSTRAINT \`FK_14371caaff44d0801b59b284166\` FOREIGN KEY (\`created_by\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`documents\` ADD CONSTRAINT \`FK_bf360069e34a63573d1df8e8e1d\` FOREIGN KEY (\`last_modified_by\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`documents\` DROP FOREIGN KEY \`FK_bf360069e34a63573d1df8e8e1d\``);
        await queryRunner.query(`ALTER TABLE \`documents\` DROP FOREIGN KEY \`FK_14371caaff44d0801b59b284166\``);
        await queryRunner.query(`ALTER TABLE \`documents\` DROP FOREIGN KEY \`FK_6d5e50a920a122baac332ce8533\``);
        await queryRunner.query(`DROP TABLE \`documents\``);
    }

}
