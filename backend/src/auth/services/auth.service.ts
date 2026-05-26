import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  ForbiddenException,
  HttpException,
  HttpStatus
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { generateSecret, verify, generateURI } from 'otplib';
import * as qrcode from 'qrcode';
import {DeepPartial, Repository} from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterDto, LoginDto } from '../models/auth.dto';
import {UserEntity} from "../../users/models/user.entity";
import {ConfigService} from "@nestjs/config";
import {UsersService} from "../../users/services/users.service";
import {SALT_ROUNDS} from "../../common/utils";

@Injectable()
export class AuthService {
  private readonly jwtSecret: string;
  constructor(
      private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {
    this.jwtSecret = this.configService.get<string>('JWT_SECRET')!;
  }

  async generateTokens(userId: string, email: string, role: string, displayName: string) {
    const jwtPayload = { sub: userId, email, role, displayName };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(jwtPayload, {
        secret: this.jwtSecret,
        expiresIn: '15m',
      }),
      this.jwtService.signAsync(jwtPayload, {
        secret: this.jwtSecret,
        expiresIn: '7d',
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  async register(registerDto: RegisterDto) {
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    const passwordHash = await bcrypt.hash(registerDto.password, SALT_ROUNDS);

    return await this.usersService.createUser({
      ...registerDto,
      password: passwordHash
    });
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmail(loginDto.email);

    if (!user || user.isBlocked) {
      throw new UnauthorizedException('Invalid Credentials');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid Credentials');
    }

    if (user.isTwoFactorAuthenticationEnabled) {
      const tempToken = await this.jwtService.signAsync(
          { sub: user.id, isTemp: true },
          { secret: this.configService.get<string>('jwtSecret'), expiresIn: '5m' }
      );

      throw new HttpException({
        message: 'MFA_REQUIRED',
        temp_token: tempToken
      }, HttpStatus.ACCEPTED);
    }

    const tokens = await this.generateTokens(user.id, user.email, user.role, user.name + ' ' + user.lastName);
    const hash = await bcrypt.hash(tokens.refreshToken, SALT_ROUNDS);
    await this.usersService.updateRefreshToken(user.id, hash);

    return tokens;
  }

  async logout(userId: string) {
    await this.usersService.updateRefreshToken(userId, null);
  }

  async refreshTokens(userId: string, refreshToken: string) {
    const user = await this.usersService.findById(userId);
    if (!user || !user.hashedRefreshToken || user.isBlocked) {
      throw new ForbiddenException('Access denied');
    }

    const refreshTokenMatches = await bcrypt.compare(refreshToken, user.hashedRefreshToken);
    if (!refreshTokenMatches) {
      throw new ForbiddenException('Access denied');
    }

    const tokens = await this.generateTokens(user.id, user.email, user.role, user.name + ' ' + user.lastName);

    const hash = await bcrypt.hash(tokens.refreshToken, SALT_ROUNDS);
    await this.usersService.updateRefreshToken(user.id, hash);

    return tokens;
  }

  async generateTwoFactorAuthenticationSecret(user: DeepPartial<UserEntity>) {

    if (!user.email || !user.id) {
      throw new UnauthorizedException('User not found');
    }
    const secret = generateSecret();

    const otpAuthUrl = generateURI({
      issuer: 'ProjetSpe4',
      label: user.email,
      secret
    });

    await this.usersService.updateTwoFactorSecret(user.id, secret);

    return await qrcode.toDataURL(otpAuthUrl);
  }

  async turnOnTwoFactorAuthentication(userId: string, code: string) {
    const user = await this.usersService.findById(userId);

    if (!user) {
      return 'User not found'
    }

    const result = await verify({
      token: code,
      secret: user.twoFactorAuthenticationSecret,
    });

    if (!result.valid) {
      throw new UnauthorizedException('The 2FA code is incorrect');
    }

    await this.usersService.turnOnTwoFactorAuth(userId);

  }

  async loginWith2fa(userId: string, code: string) {
    const user = await this.usersService.findById(userId);
    if (!user || user.isBlocked) throw new UnauthorizedException('Access denied');

    const result = await verify({
      token: code,
      secret: user.twoFactorAuthenticationSecret,
    });

    if (!result.valid) {
      throw new UnauthorizedException('Incorrect 2FA code');
    }

    const tokens = await this.generateTokens(user.id, user.email, user.role, user.name + ' ' + user.lastName);

    const hash = await bcrypt.hash(tokens.refreshToken, SALT_ROUNDS);
    await this.usersService.updateRefreshToken(user.id, hash);

    return tokens;
  }
}