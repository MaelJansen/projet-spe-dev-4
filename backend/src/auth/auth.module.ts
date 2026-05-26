import { Module } from '@nestjs/common';
import { AuthController } from "./controllers/auth.controller";
import { AuthService } from "./services/auth.service";
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import {JwtStrategy} from "./strategies/jwt.strategy";
import {Jwt2faStrategy} from "./strategies/jwt-2fa.strategy";
import {UsersModule} from "../users/users.module";

@Module({
    imports: [
        UsersModule,
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