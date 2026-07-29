import { Module } from '@nestjs/common';
import { CounsellorService } from './counsellor.service';
import { CounsellorController } from './counsellor.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Counsellor } from './entities/counsellor.entity';
import { UserService } from 'src/user/user.service';
import { UserModule } from 'src/user/user.module';
import { User } from 'src/user/entities/user.entity';

@Module({
   imports: [
    UserModule,
    TypeOrmModule.forFeature([Counsellor, User]),
  ],
  controllers: [CounsellorController],
  providers: [CounsellorService],
})
export class CounsellorModule {}
