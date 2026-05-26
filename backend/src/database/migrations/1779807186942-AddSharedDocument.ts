import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSharedDocument1779807186942 implements MigrationInterface {
    name = 'AddSharedDocument1779807186942'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`document_shares\` (\`id\` varchar(36) NOT NULL, \`permission\` enum ('READ', 'WRITE') NOT NULL, \`document\` varchar(36) NULL, \`user\` varchar(36) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`document_shares\` ADD CONSTRAINT \`FK_779c2202e09721d164f9e4b4638\` FOREIGN KEY (\`document\`) REFERENCES \`documents\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`document_shares\` ADD CONSTRAINT \`FK_953c166561b926364f791689152\` FOREIGN KEY (\`user\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`document_shares\` DROP FOREIGN KEY \`FK_953c166561b926364f791689152\``);
        await queryRunner.query(`ALTER TABLE \`document_shares\` DROP FOREIGN KEY \`FK_779c2202e09721d164f9e4b4638\``);
        await queryRunner.query(`DROP TABLE \`document_shares\``);
    }

}
