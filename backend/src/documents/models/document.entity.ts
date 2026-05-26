import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    OneToMany,
    JoinColumn, DeleteDateColumn
} from 'typeorm';
import { UserEntity } from '../../users/models/user.entity';

export enum DocumentType {
    FOLDER = 'FOLDER',
    TEXT_DOC = 'TEXT_DOC',
    IMPORTED_FILE = 'IMPORTED_FILE'
}

@Entity('documents')
export class DocumentEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 255 })
    name: string;

    @Column({ type: 'enum', enum: DocumentType })
    type: DocumentType;

    @Column({ type: 'text', nullable: true })
    content: string | null;

    @Column({ type: 'varchar', length: 500, nullable: true })
    fileUrl: string | null;

    @ManyToOne(() => DocumentEntity, (document) => document.children, { onDelete: 'CASCADE', nullable: true })
    @JoinColumn({ name: 'parentFolderId' })
    parentFolder: DocumentEntity | null;

    @OneToMany(() => DocumentEntity, (document) => document.parentFolder)
    children: DocumentEntity[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn()
    deletedAt: Date | null;

    @ManyToOne(() => UserEntity, { nullable: false })
    @JoinColumn({ name: 'createdById' })
    createdBy: UserEntity;

    @ManyToOne(() => UserEntity, { nullable: false })
    @JoinColumn({ name: 'lastModifiedById' })
    lastModifiedBy: UserEntity;
}