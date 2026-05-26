import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import {Injectable, UnauthorizedException} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
    constructor(configService: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: configService.get<string>('jwtSecret')!,
            passReqToCallback: true,
        });
    }

    validate(req: Request, payload: any) {
        const authHeader = req.get('Authorization');
        if (!authHeader) {
            throw new UnauthorizedException('Invalid token');
        }

        const refreshToken = authHeader.replace('Bearer', '').trim();

        return {
            id: payload.sub,
            email: payload.email,
            role: payload.role,
            refreshToken,
        };
    }
}