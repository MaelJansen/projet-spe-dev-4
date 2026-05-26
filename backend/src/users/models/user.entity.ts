import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
import {Exclude} from "class-transformer";

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ type: 'varchar', length: 50 })
  name: string;

  @Column({ type: 'varchar', length: 50 })
  lastName: string;

  @Exclude()
  @Column()
  password: string;

  @Column({ default: 'user' })
  role: string;

  @Column({ default: false })
  isBlocked: boolean;

  @Exclude()
  @Column({ type: 'varchar', nullable: true })
  hashedRefreshToken?: string | null;

  @Column({ nullable: true })
  twoFactorAuthenticationSecret: string;

  @Column({ default: false })
  isTwoFactorAuthenticationEnabled: boolean;

  @CreateDateColumn()
  createdAt: Date;
}