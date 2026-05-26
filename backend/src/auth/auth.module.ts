// src/modules/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { AuthController } from "./controllers/auth.controller";
import { AuthService } from "./services/auth.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserEntity } from "../users/models/user.entity";
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import {JwtStrategy} from "./strategies/jwt.strategy";
import {Jwt2faStrategy} from "./strategies/jwt-2fa.strategy";

@Module({
    imports: [
        TypeOrmModule.forFeature([UserEntity]),
        ConfigModule,
        JwtModule.register({}),
    ],
    controllers: [AuthController],
    providers: [
        AuthService,
        JwtStrategy,
        JwtRefreshStrategy,
        Jwt2faStrategy
    ],
})
export class AuthModule {}