import { Module } from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { SessionsController } from './sessions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Session } from './entities/session.entity';
import { Counsellor } from 'src/counsellor/entities/counsellor.entity';


@Module({
  imports: [TypeOrmModule.forFeature([Session, Counsellor])],
  controllers: [SessionsController],
  providers: [SessionsService],
})
export class SessionsModule {}
