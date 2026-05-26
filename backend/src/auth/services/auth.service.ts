import {Injectable, UnauthorizedException, ConflictException, ForbiddenException} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterDto, LoginDto } from '../models/auth.dto';
import {UserEntity} from "../../users/models/user.entity";
import {ConfigService} from "@nestjs/config";

const SALT_ROUNDS = 10;

@Injectable()
export class AuthService {
  private readonly jwtSecret: string;
  constructor(
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {
    this.jwtSecret = this.configService.get<string>('JWT_SECRET')!;
  }

  async getUserByEmail(email: string) {
    return await this.usersRepository.findOne({ where: { email } });
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

  async updateRefreshTokenHash(userId: string, refreshToken: string) {
    const hash = await bcrypt.hash(refreshToken, SALT_ROUNDS);
    await this.usersRepository.update(userId, {
      hashedRefreshToken: hash,
    });
  }

  async register(registerDto: RegisterDto) {
    const existingUser = await this.getUserByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    const passwordHash = await bcrypt.hash(registerDto.password, SALT_ROUNDS);

    const newUser = this.usersRepository.create({
      ...registerDto,
      password: passwordHash
    });
    
    return await this.usersRepository.save(newUser);
  }

  async login(loginDto: LoginDto) {
    const user = await this.getUserByEmail(loginDto.email);

    if (!user || user.isBlocked) {
      throw new UnauthorizedException('Invalid Credentials');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid Credentials');
    }

    const tokens = await this.generateTokens(user.id, user.email, user.role, user.name + ' ' + user.lastName);
    await this.updateRefreshTokenHash(user.id, tokens.refreshToken);

    return tokens;
  }

  async logout(userId: string) {
    await this.usersRepository.update(userId, { hashedRefreshToken: null });
  }

  async refreshTokens(userId: string, refreshToken: string) {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user || !user.hashedRefreshToken || user.isBlocked) {
      throw new ForbiddenException('Access denied');
    }

    const refreshTokenMatches = await bcrypt.compare(refreshToken, user.hashedRefreshToken);
    if (!refreshTokenMatches) {
      throw new ForbiddenException('Access denied');
    }

    const tokens = await this.generateTokens(user.id, user.email, user.role, user.name + ' ' + user.lastName);
    await this.updateRefreshTokenHash(user.id, tokens.refreshToken);

    return tokens;
  }
}