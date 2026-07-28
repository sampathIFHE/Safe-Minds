import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CounsellorModule } from './counsellor/counsellor.module';
@Module({
  imports: [ // Load environment variables from .env
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,      
      autoLoadEntities: true,
      synchronize: true, // Automatically creates tables (turn off in production)
      ssl: {
        rejectUnauthorized: false, // Needed for Neon
      },
      entitySkipConstructor: true,
    }),

    CounsellorModule,],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
