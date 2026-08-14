import { Module } from '@nestjs/common';
import { ClientService } from './client.service';
import { ClientController } from './client.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Client } from './entities/client.entity';
import { UserModule } from 'src/user/user.module';
import { User } from 'src/user/entities/user.entity';
import { Counsellor } from 'src/counsellor/entities/counsellor.entity';
import { Session } from 'src/sessions/entities/session.entity';

@Module({
  imports:[
    UserModule,
    TypeOrmModule.forFeature([Client, User, Counsellor, Session]),],
  controllers: [ClientController],
  providers: [ClientService],
})
export class ClientModule {}
