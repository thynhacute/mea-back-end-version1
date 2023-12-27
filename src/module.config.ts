import { NKConfig } from './core';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const databaseConfig: TypeOrmModuleOptions = {
    type: 'postgres',
    host: NKConfig.DB_HOST,
    port: NKConfig.DB_PORT,
    username: NKConfig.DB_USERNAME,
    password: NKConfig.DB_PASSWORD,
    database: NKConfig.DB_NAME,
    synchronize: true,
    keepConnectionAlive: true,
    entities: [__dirname + '/**/*.entity{.ts,.js}'],
    extra: { connectionLimit: 1 },
    cli: {},
};

export default databaseConfig;
