import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateCounsellorDto } from './dto/create-counsellor.dto';
import { UpdateCounsellorDto } from './dto/update-counsellor.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Counsellor } from './entities/counsellor.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CounsellorService {
  constructor(
  @InjectRepository(Counsellor)
  private readonly counsellorRepository: Repository<Counsellor>,
) {}
  async create(createCounsellorDto: CreateCounsellorDto) {
    const existing = await this.counsellorRepository.findOneBy({
      email: createCounsellorDto.email,
      mobile: createCounsellorDto.mobile,
      employeeId: createCounsellorDto.employeeId,
    });

    if (existing) {
      throw new BadRequestException(
        "Counsellor with email , mobile number or employee ID already exists"
      );
    }
 const counsellor = this.counsellorRepository.create(createCounsellorDto);
  return await this.counsellorRepository.save(counsellor);  }

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
    const counsellors = await this.findAll();
    return await this.counsellorRepository.remove(counsellors);
  }
}
