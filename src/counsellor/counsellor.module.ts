import { forwardRef, Module } from '@nestjs/common';
import { CounsellorService } from './counsellor.service';
import { CounsellorController } from './counsellor.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Counsellor } from './entities/counsellor.entity';
import { UserService } from 'src/user/user.service';
import { UserModule } from 'src/user/user.module';
import { User } from 'src/user/entities/user.entity';
import { CounsellorBlock } from './entities/counsellor-block.entity';
import { Session } from 'src/sessions/entities/session.entity';
import { SessionsModule } from 'src/sessions/sessions.module';

@Module({
   imports: [
    UserModule,
    forwardRef(() => SessionsModule),
    TypeOrmModule.forFeature([Counsellor, User, CounsellorBlock, Session]),
  ],
  controllers: [CounsellorController],
  providers: [CounsellorService],
  exports:[CounsellorService]
})
export class CounsellorModule {}
