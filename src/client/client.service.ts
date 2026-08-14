import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Client, ClientType } from './entities/client.entity';
import { Repository } from 'typeorm';
import { User, UserRole } from 'src/user/entities/user.entity';
import { Counsellor } from 'src/counsellor/entities/counsellor.entity';
import { Session, SessionStatus } from 'src/sessions/entities/session.entity';
@Injectable()
export class ClientService {
  constructor(
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Counsellor)
    private readonly counsellorRepository: Repository<Counsellor>,

    @InjectRepository(Session)
    private readonly sessionRepository: Repository<Session>,
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

async getClientDashboard(userId: string) {
  const client = await this.clientRepository.findOne({
    where: {
      userId,
    },
  });

  if (!client) {
    throw new NotFoundException("Client not found");
  }

  let counsellor:any = null;

  if (client.counsellorId) {
    counsellor = await this.counsellorRepository.findOne({
      where: {
        id: client.counsellorId,
      },
    });
  }

  const sessions:any = await this.sessionRepository.find({
    where: {
      clientId: client.id,
    },
    order: {
      scheduledStartTime: "DESC",
    },
  });

  const now = new Date();

  const currentSession = sessions.find(
    (session) =>
      (session.status === SessionStatus.BOOKED ||
        session.status === SessionStatus.ONGOING) &&
      new Date(session.scheduledEndTime) > now,
  );

  const pendingSessionConfirmation = sessions.find(
    (session) =>
      session.status === SessionStatus.BOOKED &&
      new Date(session.scheduledEndTime) <= now,
  );

  const previousSession = sessions.find(
    (session) =>
      session.status === SessionStatus.COMPLETED ||
      session.status === SessionStatus.NO_SHOW ||
      session.status === SessionStatus.RESCHEDULED,
  );

  return {
    client: {
      id: client.id,
      name: `${client.firstName} ${client.lastName ?? ""}`.trim(),
      email: client.email,
    },

    counsellor: counsellor
      ? {
          assigned: true,
          id: counsellor.id,
          name: counsellor.name,
        }
      : {
          assigned: false,
        },

    currentSession: currentSession
      ? {
          hasSession: true,
          id: currentSession.id,
          status: currentSession.status,
          scheduledStartTime: currentSession.scheduledStartTime,
          scheduledEndTime: currentSession.scheduledEndTime,
          sessionType: currentSession.sessionType,
        }
      : {
          hasSession: false,
        },

    pendingSessionConfirmation: pendingSessionConfirmation
      ? {
          id: pendingSessionConfirmation.id,
          status: pendingSessionConfirmation.status,
          scheduledStartTime:
            pendingSessionConfirmation.scheduledStartTime,
          scheduledEndTime:
            pendingSessionConfirmation.scheduledEndTime,
        }
      : null,

    previousSession: previousSession
      ? {
          id: previousSession.id,
          status: previousSession.status,
          scheduledStartTime: previousSession.scheduledStartTime,
          scheduledEndTime: previousSession.scheduledEndTime,
          actualStartTime: previousSession.actualStartTime,
          actualEndTime: previousSession.actualEndTime,
        }
      : null,
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
