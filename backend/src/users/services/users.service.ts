import {BadRequestException, Injectable, NotFoundException} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UserEntity } from "../models/user.entity";
import { DeepPartial, Repository } from "typeorm";
import {UpdatePasswordDto, UpdateProfileDto} from "../models/user.dto";
import {SALT_ROUNDS} from "../../common/utils";
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(UserEntity)
        private usersRepository: Repository<UserEntity>
    ) {}

    async findByEmail(email: string): Promise<UserEntity | null> {
        return await this.usersRepository.findOne({ where: { email } });
    }

    async findById(userId: string): Promise<UserEntity | null> {
        return await this.usersRepository.findOne({ where: { id: userId } });
    }

    async createUser(userData: DeepPartial<UserEntity>): Promise<UserEntity> {
        const newUser = this.usersRepository.create(userData);
        return await this.usersRepository.save(newUser);
    }

    async updateRefreshToken(userId: string, hashedRefreshToken: string | null): Promise<void> {
        await this.usersRepository.update(userId, { hashedRefreshToken });
    }

    async updateTwoFactorSecret(userId: string, secret: string): Promise<void> {
        await this.usersRepository.update(userId, { twoFactorAuthenticationSecret: secret });
    }

    async turnOnTwoFactorAuth(userId: string): Promise<void> {
        await this.usersRepository.update(userId, { isTwoFactorAuthenticationEnabled: true });
    }

    async updateProfile(userId: string, updateProfileDto: UpdateProfileDto) {
        const user = await this.findById(userId);
        if (!user) throw new NotFoundException('User not found');

        await this.usersRepository.update(userId, {
            ...(updateProfileDto.name && { name: updateProfileDto.name }),
            ...(updateProfileDto.lastName && { lastName: updateProfileDto.lastName }),
        });

        return await this.findById(userId);
    }

    async updatePassword(userId: string, updatePasswordDto: UpdatePasswordDto) {
        const user = await this.findById(userId);

        if (!user) {
            throw new NotFoundException('User not found');
        }

        const isOldPasswordValid = await bcrypt.compare(updatePasswordDto.currentPassword, user.password);
        if (!isOldPasswordValid) {
            throw new BadRequestException('Invalid credentials');
        }

        const isSamePassword = await bcrypt.compare(updatePasswordDto.newPassword, user.password);
        if (isSamePassword) {
            throw new BadRequestException('The new password cannot be the same as the current one');
        }

        const newPasswordHash = await bcrypt.hash(updatePasswordDto.newPassword, SALT_ROUNDS);

        await this.usersRepository.update(userId, {
            password: newPasswordHash,
            hashedRefreshToken: null
        });

        return await this.findById(userId);
    }
}