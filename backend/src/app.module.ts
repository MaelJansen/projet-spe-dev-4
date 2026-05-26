import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from './configuration';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { DocumentsModule } from './documents/documents.module';
import {CustomNamingStrategy} from "./database/naming.strategy";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.get<string>('sql.host'),
        port: config.get<number>('sql.port'),
        username: config.get<string>('sql.user'),
        password: config.get<string>('sql.password'),
        database: config.get<string>('sql.name'),
        autoLoadEntities: true,
        synchronize: false,
        namingStrategy: new CustomNamingStrategy(),
      }),
    }),

    AuthModule,

    UsersModule,

    DocumentsModule,
  ],
})
export class AppModule {}