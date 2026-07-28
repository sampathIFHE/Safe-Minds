import { Module } from '@nestjs/common';
import { CounsellorService } from './counsellor.service';
import { CounsellorController } from './counsellor.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Counsellor } from './entities/counsellor.entity';

@Module({
   imports: [
    TypeOrmModule.forFeature([Counsellor]),
  ],
  controllers: [CounsellorController],
  providers: [CounsellorService],
})
export class CounsellorModule {}
