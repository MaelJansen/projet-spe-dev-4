import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm';
import { UserEntity } from '../../users/models/user.entity';
import { DocumentEntity } from './document.entity';

export enum PermissionLevel {
    READ = 'READ',
    WRITE = 'WRITE'
}

@Entity('document_shares')
export class DocumentShareEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => DocumentEntity, (doc) => doc.id, { onDelete: 'CASCADE' })
    document: DocumentEntity;

    @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
    user: UserEntity;

    @Column({ type: 'enum', enum: PermissionLevel })
    permission: PermissionLevel;
}