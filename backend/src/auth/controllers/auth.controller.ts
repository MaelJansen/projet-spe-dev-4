import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import {AuthService} from "../services/auth.service";
import {LoginDto, RegisterDto} from "../models/auth.dto";


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
}