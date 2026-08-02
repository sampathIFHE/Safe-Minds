import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Client, ClientType } from './entities/client.entity';
import { Repository } from 'typeorm';
import { User, UserRole } from 'src/user/entities/user.entity';

@Injectable()
export class ClientService {
  constructor(
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ){
  }
  async create(createClientDto: CreateClientDto) {

    const identifier = createClientDto.employeeId || createClientDto.studentId;
    const existingUser = await this.userRepository.findOne({
      where:{
        identifier,
        role:UserRole.CLIENT
      }
    });
  
    const emailExist = await this.userRepository.findOne({
      where: [
        { email: createClientDto.email },
        { mobile: createClientDto.mobile },
      ],
    });
    
    if (emailExist) {
      throw new BadRequestException(
        "Email or mobile number is already registered.",
      );
    }
    if(existingUser){
      if(existingUser.email || existingUser.mobile){
        throw new BadRequestException(
          "You are already registered. Please login to continue."
        );
      }
      await this.userRepository.update(
        existingUser.id,
        {
          lastName:createClientDto.lastName ?? existingUser.lastName,
          email:createClientDto.email ?? existingUser.email,
          mobile:createClientDto.mobile ?? existingUser.mobile,
        }
      );
      const existingClientProfile =
        await this.clientRepository.findOne({
          where:{
            userId:existingUser.id
          }
        });
      if(existingClientProfile){
        await this.clientRepository.update(
          existingClientProfile.id,
          {
            lastName:createClientDto.lastName ?? existingClientProfile.lastName,
            email:createClientDto.email ?? existingClientProfile.email,
            mobile:createClientDto.mobile ?? existingClientProfile.mobile,
            department:createClientDto.department ?? existingClientProfile.department,
            school:createClientDto.school ?? existingClientProfile.school,
            batch:createClientDto.batch ?? existingClientProfile.batch,
          }
        );
        return {
          message:"Registration was completed successfully"
        };
      }
    }
    const newUser = this.userRepository.create({
      ...createClientDto,
      identifier,
      role:UserRole.CLIENT
    });
    await this.userRepository.save(newUser);
    const newClient = this.clientRepository.create({
      ...createClientDto,
      userId:newUser.id
    });
    await this.clientRepository.save(newClient);
    return {
      message:"Registration was completed successfully",
      data:newClient
    };
  }
    
  async search(identifier: string) {
    const user = await this.userRepository.findOne({
      where: {
        identifier,
        role: UserRole.CLIENT,
      },
    });
  
    if (!user) {
   return {clientExist: false,
    message: "Client not found",
  };    }
    const client = await this.clientRepository.findOne({where:{userId:user.id}})
  
    if(client){
      return {
        clientExist:true,
        data:client
      }
    }
    return {clientExist:false, message:"Client not found"}
  }
  
  async findAll() {
    const clients = await this.clientRepository.find({
      order: {
        createdAt: "DESC",
      },
    })
    if(!clients || clients.length == 0){
      throw new NotFoundException("There are no Clients here")
    }
    return clients;
  }

  async findOne(id: string) {
    const client = await this.clientRepository.findOne({
      where: {
        id,
      },
    });
  
    if (!client) {
      throw new NotFoundException("Client not found");
    }
  
    return client;
  }

  async update(
    id: string,
    dto: UpdateClientDto,
  ) {
    const client = await this.clientRepository.findOne({
      where: {
        id,
      },
    });
  
    if (!client) {
      throw new NotFoundException("Client not found");
    }
  
    await this.clientRepository.update(id, dto);
  
    return {
      message: "Client updated successfully",
    };
  }

  async remove(id: string) {
    const client = await this.clientRepository.findOne({
      where: {
        id,
      },
    });
  
    if (!client) {
      throw new NotFoundException("Client not found");
    }
  
    await this.userRepository.delete(client.userId);
    await this.clientRepository.delete(id);
  
    return {
      message: "Client deleted successfully",
    };
  }
}
