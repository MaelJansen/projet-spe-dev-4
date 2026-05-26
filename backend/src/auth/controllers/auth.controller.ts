import {Controller, Post, Body, HttpCode, HttpStatus, UseGuards, Req} from '@nestjs/common';
import {AuthService} from "../services/auth.service";
import {LoginDto, RegisterDto, TwoFactorCodeDto} from "../models/auth.dto";
import {JwtRefreshGuard} from "../../common/guards/jwt-refresh.guard";
import {JwtAuthGuard} from "../../common/guards/jwt-auth-guard";
import type {RequestWithUser} from "../../common/interfaces/active-user.interface";
import {Jwt2faGuard} from "../../common/guards/jwt-2fa.guard";


@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('register')
    register(@Body() registerDto: RegisterDto) {
        return this.authService.register(registerDto);
    }

    @HttpCode(HttpStatus.OK)
    @Post('login')
    login(@Body() loginDto: LoginDto) {
        return this.authService.login(loginDto);
    }

    @UseGuards(Jwt2faGuard)
    @HttpCode(HttpStatus.OK)
    @Post('login/2fa')
    loginWith2fa(@Req() req: RequestWithUser, @Body() body: TwoFactorCodeDto) {
        return this.authService.loginWith2fa(req.user.id, body.code);
    }

    @UseGuards(JwtAuthGuard)
    @Post('2fa/generate')
    generate2fa(@Req() req: RequestWithUser) {
        return this.authService.generateTwoFactorAuthenticationSecret(req.user);
    }

    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    @Post('2fa/turn-on')
    turnOn2fa(@Req() req: RequestWithUser, @Body() body: TwoFactorCodeDto) {
        return this.authService.turnOnTwoFactorAuthentication(req.user.id, body.code);
    }

    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    @Post('logout')
    logout(@Req() req: RequestWithUser) {
        return this.authService.logout(req.user.id);
    }

    @UseGuards(JwtRefreshGuard)
    @HttpCode(HttpStatus.OK)
    @Post('refresh')
    refreshTokens(@Req() req: RequestWithUser) {
        const userId = req.user.id;
        const refreshToken = req.user.refreshToken!;
        return this.authService.refreshTokens(userId, refreshToken);
    }
}