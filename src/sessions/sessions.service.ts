import { BadRequestException, forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { Repository } from 'typeorm';
import { Session, SessionStatus } from './entities/session.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Counsellor } from 'src/counsellor/entities/counsellor.entity';
import { CounsellorService } from 'src/counsellor/counsellor.service';
import { Client } from 'src/client/entities/client.entity';
import * as nodemailer from 'nodemailer';
import { join } from 'path';
import { clientSessionTemplate } from 'src/mailTemplates/client-session-booked.template';
import { counsellorSessionTemplate } from 'src/mailTemplates/counsellor-session-booked.template';


@Injectable()
export class SessionsService {
   private transporter;

  constructor(
      @InjectRepository(Session)
      private readonly sessionsRepository: Repository<Session>,
      @InjectRepository(Counsellor)
      private readonly counsellorRepository: Repository<Counsellor>,
      @Inject(forwardRef(() => CounsellorService))
      private readonly counsellorService: CounsellorService,
      @InjectRepository(Client)
      private readonly clientRepository:Repository<Client>
    ) {
          this.transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
              user: process.env.MAIL_USER,
              pass: process.env.MAIL_PASS,
            },
          });
    }


 async create(createSessionDto: CreateSessionDto) {
    const counsellor = await this.counsellorRepository.findOne({
      where: { id: createSessionDto.counsellorId },
    });

    if (!counsellor) {
      throw new NotFoundException('Counsellor not found.');
    }

    const client = await this.clientRepository.findOne({
      where:{id:createSessionDto.clientId}
    })
    
    if(!client){
      throw new NotFoundException('Client not found.');
    }

    const existingClinetSessions = await this.sessionsRepository.find({
      where:[
        {
          clientId:createSessionDto.clientId,
          status:SessionStatus.BOOKED
        },
        {
          clientId:createSessionDto.clientId,
          status:SessionStatus.ONGOING
        }
      ]
     });
    if(existingClinetSessions.length>0){
     throw new BadRequestException("You can't book a session when you are not completed the previous session")
    }
    // Calculate end time from session duration
    const scheduledStartTime = new Date(createSessionDto.scheduledStartTime);

    const scheduledEndTime = new Date(scheduledStartTime);
    scheduledEndTime.setMinutes(
      scheduledEndTime.getMinutes() + counsellor.sessionDuration,
    );

    const requestedEndTime = new Date(scheduledEndTime);
requestedEndTime.setMinutes(
  requestedEndTime.getMinutes() + counsellor.bufferTime,
);
// Format for email
const sessionDate = scheduledStartTime.toLocaleDateString("en-IN", {
  timeZone: "Asia/Kolkata",
  day: "2-digit",
  month: "long",
  year: "numeric",
});

const startTime = scheduledStartTime.toLocaleTimeString("en-IN", {
  timeZone: "Asia/Kolkata",
  hour: "2-digit",
  minute: "2-digit",
  hour12: true,
});

const endTime = scheduledEndTime.toLocaleTimeString("en-IN", {
  timeZone: "Asia/Kolkata",
  hour: "2-digit",
  minute: "2-digit",
  hour12: true,
});
    // Existing active sessions
const existingSession = await this.sessionsRepository
  .createQueryBuilder('session')
  .where('session.counsellorId = :counsellorId', {
    counsellorId: counsellor.id,
  })
  .andWhere(
    `
    session.scheduledStartTime < :requestedEnd
    AND
    (session.scheduledEndTime + (:bufferTime * INTERVAL '1 minute')) > :requestedStart
    `,
    {
      requestedStart: scheduledStartTime,
      requestedEnd: scheduledEndTime,
      bufferTime: counsellor.bufferTime,
    },
  )
  .getOne();

if (existingSession) {
  throw new BadRequestException(
    'Counsellor is not available for the selected time.',
  );
}
    const blockCheck = await this.counsellorService.checkCounsellorBlock(
      createSessionDto.counsellorId,
      scheduledStartTime,
      scheduledEndTime,
    );
  
    if (!blockCheck.available) {
      throw new BadRequestException(blockCheck.message);
    }


    // Determine session number for the client
    let sessionNumber = 1;

    if (createSessionDto.clientId) {
      const previousSessions = await this.sessionsRepository.count({
        where: {
          clientId: createSessionDto.clientId,
          counsellorId: counsellor.id,
        },
      });

      sessionNumber = previousSessions + 1;
    }

    const session = this.sessionsRepository.create({
      ...createSessionDto,
      scheduledStartTime,
      scheduledEndTime,
      sessionNumber,
      status: SessionStatus.BOOKED,
      counsellorName:`${counsellor.firstName} ${counsellor.lastName}`,
      clientName:`${client.firstName} ${client.lastName}`
    });

      await this.transporter.sendMail({
          from: `"Safe Minds" <${process.env.MAIL_USER}>`,
          to: client.email,
          subject:  `Hello ${client.firstName} ${client.lastName}, Your Safe Minds counselling session is confirmed`,
          html:clientSessionTemplate(
    `${client.firstName} ${client.lastName}`,
    `${counsellor.firstName} ${counsellor.lastName}`,
    counsellor.location || '',
    sessionDate,
    startTime,
    endTime,
    session.type,
  ),
          attachments: [
        {
          filename: 'Safe_Minds_Logo.png',
          path: join(process.cwd(), 'public', 'Safe_Minds_Logo.png'),
          cid: 'safe-minds-logo',
        },
      ],
        });

              await this.transporter.sendMail({
          from: `"Safe Minds" <${process.env.MAIL_USER}>`,
          to: counsellor.email,
          subject:  `New Counselling Session Assigned – ${client.firstName} ${client.lastName}`,
          html:counsellorSessionTemplate (
    `${counsellor.firstName} ${counsellor.lastName}`,
    `${client.firstName} ${client.lastName}`,
    session.sessionNumber,
    sessionDate,
    startTime,
    endTime,
    session.type,
    client.department || '',
    client.school || '',
    client.batch || '',
    client.referredBy || ''
  ),
          attachments: [
        {
          filename: 'Safe_Minds_Logo.png',
          path: join(process.cwd(), 'public', 'Safe_Minds_Logo.png'),
          cid: 'safe-minds-logo',
        },
      ],
        });
    
    return await this.sessionsRepository.save(session);
  }

async removeAll() {
    const sessions = await this.sessionsRepository.find();
    if (!sessions || sessions.length === 0) {
      throw new NotFoundException('No sessions found to delete.');
    }
    await this.sessionsRepository.remove(sessions);
    return { message: 'All sessions have been deleted.' };
  }

  async getsessionsByCounsellor(counsellorId: string) {
    const sessions = await this.sessionsRepository.find({
      where: { counsellorId },
    });
    if (!sessions || sessions.length === 0) {
      throw new NotFoundException('No sessions found for this counsellor.');
    } 
    return sessions;
  }

 async findAll() {
  const sessions = await this.sessionsRepository.find();
  if(!sessions || sessions.length === 0) {
    throw new NotFoundException('No sessions found.');
  }
  return sessions;
  }

  async findOne(id: string) {
    const session = await this.sessionsRepository.findOne({ where: { id } });
    if(!session) {
      throw new NotFoundException(`Session with ID ${id} not found.`);
    }
    return session;
  }

  async update(id: string, updateSessionDto: UpdateSessionDto) {
    const session = await this.sessionsRepository.findOne({ where: { id } });
    if(!session) {
      throw new NotFoundException(`Session with ID ${id} not found.`);
    }
    Object.assign(session, updateSessionDto);
    return await this.sessionsRepository.save(session);
  }

 async remove(id: string) {
    const session = await this.sessionsRepository.findOne({ where: { id } });
    if(!session) {
      throw new NotFoundException(`Session with ID ${id} not found.`);
    }
    return this.sessionsRepository.remove(session);
  }

  
}
