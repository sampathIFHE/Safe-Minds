import { forwardRef, Module } from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { SessionsController } from './sessions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Session } from './entities/session.entity';
import { Counsellor } from 'src/counsellor/entities/counsellor.entity';
import { CounsellorModule } from 'src/counsellor/counsellor.module';


@Module({
  imports: [  forwardRef(() => CounsellorModule),
    TypeOrmModule.forFeature([Session, Counsellor])],
  controllers: [SessionsController],
  providers: [SessionsService],
})
export class SessionsModule {}
