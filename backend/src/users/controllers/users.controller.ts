import {Controller, Patch, Body, UseGuards, Req, HttpCode, HttpStatus} from '@nestjs/common';
import {UsersService} from "../services/users.service";
import {JwtAuthGuard} from "../../common/guards/jwt-auth-guard";
import type {RequestWithUser} from "../../common/interfaces/active-user.interface";
import {UpdatePasswordDto, UpdateProfileDto} from "../models/user.dto";

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Patch('profile')
    updateProfile(@Req() req: RequestWithUser, @Body() updateProfileDto: UpdateProfileDto) {
        return this.usersService.updateProfile(req.user.id, updateProfileDto);
    }


    @HttpCode(HttpStatus.OK)
    @Patch('password')
    async updatePassword(
        @Req() req: RequestWithUser,
        @Body() updatePasswordDto: UpdatePasswordDto
    ) {
        return await this.usersService.updatePassword(req.user.id, updatePasswordDto);
    }
}