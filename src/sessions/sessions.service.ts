import { BadRequestException, forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { Repository } from 'typeorm';
import { Session, SessionStatus } from './entities/session.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Counsellor } from 'src/counsellor/entities/counsellor.entity';
import { CounsellorService } from 'src/counsellor/counsellor.service';

@Injectable()
export class SessionsService {

  constructor(
      @InjectRepository(Session)
      private readonly sessionsRepository: Repository<Session>,
      @InjectRepository(Counsellor)
      private readonly counsellorRepository: Repository<Counsellor>,
      @Inject(forwardRef(() => CounsellorService))
      private readonly counsellorService: CounsellorService,

    ) {}


 async create(createSessionDto: CreateSessionDto) {
    const counsellor = await this.counsellorRepository.findOne({
      where: { id: createSessionDto.counsellorId },
    });

    if (!counsellor) {
      throw new NotFoundException('Counsellor not found.');
    }

    // Calculate end time from session duration
    const scheduledStartTime = new Date(createSessionDto.scheduledStartTime);

    const scheduledEndTime = new Date(scheduledStartTime);
    scheduledEndTime.setMinutes(
      scheduledEndTime.getMinutes() + counsellor.sessionDuration,
    );

    // Existing active sessions
    const existingSessions = await this.sessionsRepository.find({
      where: {
        counsellorId: counsellor.id,
      },
    });

    const blockCheck = await this.counsellorService.checkCounsellorBlock(
      createSessionDto.counsellorId,
      createSessionDto.scheduledStartTime,
      createSessionDto.scheduledEndTime,
    );
  
    if (!blockCheck.available) {
      throw new BadRequestException(blockCheck.message);
    }

    const hasConflict = existingSessions.some((session) => {
      if (
        session.status === SessionStatus.CANCELLED_BY_CLIENT ||
        session.status === SessionStatus.CANCELLED_BY_COUNSELLOR ||
        session.status === SessionStatus.COMPLETED
      ) {
        return false;
      }

      const existingStart = new Date(session.scheduledStartTime);

      // Existing session occupies its duration + buffer
      const existingEnd = new Date(session.scheduledEndTime);
      existingEnd.setMinutes(
        existingEnd.getMinutes() + counsellor.bufferTime,
      );

      return (
        scheduledStartTime < existingEnd &&
        scheduledEndTime > existingStart
      );
    });

    if (hasConflict) {
      throw new BadRequestException(
        'Counsellor is not available for the selected time.',
      );
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
    });

    return await this.sessionsRepository.save(session);
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
