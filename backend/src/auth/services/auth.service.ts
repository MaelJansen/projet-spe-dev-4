import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterDto, LoginDto } from '../models/auth.dto';
import {UserEntity} from "../../users/models/user.entity";

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
    private jwtService: JwtService,
  ) {}

  async getUserByEmail(email: string) {
    return await this.usersRepository.findOne({ where: { email } });
  }

  async register(registerDto: RegisterDto) {

    const existingUser = await this.getUserByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(registerDto.password, saltRounds);

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

    const payload = { sub: user.id, email: user.email, role: user.role, displayName: user.name + ' ' + user.lastName };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}