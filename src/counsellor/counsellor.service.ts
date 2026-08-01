import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCounsellorDto } from './dto/create-counsellor.dto';
import { UpdateCounsellorDto } from './dto/update-counsellor.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Counsellor } from './entities/counsellor.entity';
import { Repository } from 'typeorm';
import { User, UserRole } from 'src/user/entities/user.entity';
import { CounsellorBlock } from './entities/counsellor-block.entity';
import { CreateCounsellorBlockDto } from './dto/create-counsellor-block.dto';
import { UpdateCounsellorBlockDto } from './dto/update-counsellor-block.dto';
import { Session, SessionStatus } from 'src/sessions/entities/session.entity';

@Injectable()
export class CounsellorService {
  constructor(
    @InjectRepository(Counsellor)
    private readonly counsellorRepository: Repository<Counsellor>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(CounsellorBlock)
    private blockRepository: Repository<CounsellorBlock>,
    @InjectRepository(Session)
    private sessionRepository: Repository<Session>
  ) { }
  async create(createCounsellorDto: CreateCounsellorDto) {
    const existing = await this.userRepository.findOneBy({
      email: createCounsellorDto.email,
      mobile: createCounsellorDto.mobile,
      identifier: createCounsellorDto.employeeId,
    });

    if (existing) {
      throw new BadRequestException(
        "User with email , mobile number or employee ID already exists"
      );
    }

    const user = await this.userRepository.save({
      email: createCounsellorDto.email,
      mobile: createCounsellorDto.mobile,
      identifier: createCounsellorDto.employeeId,
      role: UserRole.COUNSELLOR,
      firstName: createCounsellorDto.firstName,
      lastName: createCounsellorDto.lastName,
    });

    const counsellor = this.counsellorRepository.create({
      ...createCounsellorDto,
      userId: user.id,
    });
    return await this.counsellorRepository.save(counsellor);
  }

  async createBlock(
    counsellorId: string,
    dto: CreateCounsellorBlockDto,
  ) {
    const counsellor = await this.counsellorRepository.findOne({
      where: { id: counsellorId },
    });

    if (!counsellor) {
      throw new NotFoundException("Counsellor not found");
    }

    if (new Date(dto.startTime) >= new Date(dto.endTime)) {
      throw new BadRequestException(
        "Start time must be before end time",
      );
    }

    const startTime = new Date(dto.startTime);
    const endTime = new Date(dto.endTime);

    const blockCheck = await this.checkCounsellorBlock(
      counsellorId,
      startTime,
      endTime,
    );

    if (!blockCheck.available) {
      throw new BadRequestException(blockCheck.message);
    }
    const sessions = await this.sessionRepository.find({
      where: {
        counsellorId,
        status: SessionStatus.BOOKED,
      },
    });
    
    const affectedSessions = sessions.filter((session) => {
      return (
        new Date(session.scheduledStartTime) < dto.endTime &&
        new Date(session.scheduledEndTime) > dto.startTime
      );
    });

    for (const session of affectedSessions) {
      session.status = SessionStatus.CANCELLED_BY_COUNSELLOR;
      await this.sessionRepository.save(session);

      // TODO:
      // Send cancellation mail to client
    }

    const block = this.blockRepository.create({
      counsellorId,
      startTime: dto.startTime,
      endTime: dto.endTime,
      reason: dto.reason,
    });

    return this.blockRepository.save(block);
  }

  async checkCounsellorBlock(
    counsellorId: string,
    startTime: Date,
    endTime: Date,
    excludeBlockId?: string,
  ) {
    const query = this.blockRepository
      .createQueryBuilder("block")
      .where("block.counsellorId = :counsellorId", {
        counsellorId,
      })
      .andWhere(
        `
        block.startTime < :endTime
        AND
        block.endTime > :startTime
        `,
        {
          startTime,
          endTime,
        },
      );
  
    if (excludeBlockId) {
      query.andWhere("block.id != :excludeBlockId", {
        excludeBlockId,
      });
    }
  
    const block = await query.getOne();
  
    if (block) {
      return {
        available: false,
        message: "Counsellor already has a block during this time",
      };
    }
  
    return {
      available: true,
    };
  }

  async getBlocks(counsellorId: string) {
    const counsellorBlocks = await this.blockRepository.find({
      where: { counsellorId },
      order: { startTime: 'ASC' }
    });

    if (!counsellorBlocks || counsellorBlocks.length == 0) {
      throw new BadRequestException("No Blocks found");
    }
    return counsellorBlocks;
  }

  async getBlockById(id) {
    const block = await this.blockRepository.findOne({
      where: { id }
    })

    if (!block) {
      throw new BadRequestException("No Block found");
    }
    return block
  }

  async updateBlock(counsellorId: string, blockId: string, dto: UpdateCounsellorBlockDto, ) {
    const block = await this.blockRepository.findOne({
      where: {
        id: blockId,
        counsellorId,
      },
    });
    if (!block) {
      throw new NotFoundException("Block not found");
    }
    const startTime = dto.startTime
      ? new Date(dto.startTime)
      : new Date(block.startTime);
    const endTime = dto.endTime
      ? new Date(dto.endTime)
      : new Date(block.endTime);
    if (startTime >= endTime) {
      throw new BadRequestException(
        "Start time must be before end time",
      );
    }
    const blockCheck = await this.checkCounsellorBlock(
      counsellorId,
      startTime,
      endTime,
      blockId,
    );
    if (!blockCheck.available) {
      throw new BadRequestException(blockCheck.message);
    }
    block.startTime = startTime;
    block.endTime = endTime;
    if (dto.reason) {
      block.reason = dto.reason;
    }
    return this.blockRepository.save(block);
  }

  async deleteBlock( blockId: string) {
    const block = await this.blockRepository.findOne({ where: { id: blockId } });
    if (!block) {
      throw new NotFoundException("Block not found");
    }
    const counsellorBLock = await this.blockRepository.remove(block);
    return { message: "Counsellor block removed successfully", data:counsellorBLock };
  }

  async removeAllBlock(){
    const blocks = await this.blockRepository.find()
    if(!blocks || blocks.length == 0){
      throw new BadRequestException("Blocks not found");
    }
    await this.blockRepository.remove(blocks)
    return {message:"All the Blocks has been removed"}
  }

  async findAll() {
    const counsellors = await this.counsellorRepository.find();
    if (!counsellors || counsellors.length === 0) {
      throw new BadRequestException("No counsellors found");
    }
    return counsellors;
  }


  async findOne(id: string) {
    const counsellor = await this.counsellorRepository.findOne({
      where: { id },
    });
    if (!counsellor) {
      throw new BadRequestException("Counsellor not found");
    }
    return counsellor;
  }


  async update(id: string, updateCounsellorDto: UpdateCounsellorDto) {
    const counsellor = await this.findOne(id);
    if (!counsellor) {
      throw new BadRequestException("Counsellor not found");
    }
    Object.assign(counsellor, updateCounsellorDto);
    return await this.counsellorRepository.save(counsellor);
  }

  async remove(id: string) {
    const counsellor = await this.findOne(id);
    if (!counsellor) {
      throw new BadRequestException("Counsellor not found");
    }
    return await this.counsellorRepository.remove(counsellor);
  }

  async removeAll() {
    const counsellors = await this.counsellorRepository.find();
    if(!counsellors || counsellors.length == 0){
      throw new BadRequestException("Counsellor not found");
    }
    await this.counsellorRepository.remove(counsellors);
  
    return {message:"All the counsellors are removed."}
  }
}
