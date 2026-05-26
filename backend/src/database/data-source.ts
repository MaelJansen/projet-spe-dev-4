import * as dotenv from 'dotenv';
dotenv.config();
import { DataSource } from 'typeorm';
import configuration from '../configuration';
import { CustomNamingStrategy } from './naming.strategy';

const conf = configuration().sql;

export const AppDataSource = new DataSource({
    type: 'mysql',
    host: conf.host,
    port: Number(conf.port),
    username: conf.user,
    password: conf.password,
    database: conf.name,

    entities: ['dist/**/*.entity.js'],
    migrations: ['dist/database/migrations/*.js'],

    synchronize: false,
    namingStrategy: new CustomNamingStrategy(),
});