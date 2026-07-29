import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
   constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

    async findByEmail(email: string) {
    return this.userRepository.findOne({
      where: { email },
    });
  }

  async save(user: User) {
    return this.userRepository.save(user);
  }
  
  create(createUserDto: CreateUserDto) {
    return 'This action adds a new user';
  }

 async findAll() {
   const users  =  await this.userRepository.find();
   if(!users){
          throw new BadRequestException("No users found");
   }
    return users;
  }

  async findOne(id: string) {
    const user  = await this.userRepository.findOne({
      where:{id},
    })

    if(!user){
          throw new BadRequestException("User not found");
    }
    return user;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
