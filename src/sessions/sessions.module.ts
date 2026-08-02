import { forwardRef, Module } from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { SessionsController } from './sessions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Session } from './entities/session.entity';
import { Counsellor } from 'src/counsellor/entities/counsellor.entity';
import { CounsellorModule } from 'src/counsellor/counsellor.module';
import { ClientModule } from 'src/client/client.module';
import { Client } from 'src/client/entities/client.entity';


@Module({
  imports: [  forwardRef(() => CounsellorModule),
    ClientModule,
    TypeOrmModule.forFeature([Session, Counsellor, Client])],
  controllers: [SessionsController],
  providers: [SessionsService],
})
export class SessionsModule {}
