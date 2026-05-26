import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../../users/models/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor(
        configService: ConfigService,
        @InjectRepository(UserEntity)
        private usersRepository: Repository<UserEntity>,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('jwtSecret')!,
        });
    }

    async validate(payload: any) {
        const user = await this.usersRepository.findOne({ where: { id: payload.sub } });

        if (!user || user.isBlocked) {
            throw new UnauthorizedException('Access denied.');
        }

        return {
            id: payload.sub,
            email: payload.email,
            role: payload.role,
        };
    }
}