import { BadRequestException, ConflictException, forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { Not, Repository } from 'typeorm';
import { Session, SessionStatus } from './entities/session.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Counsellor } from 'src/counsellor/entities/counsellor.entity';
import { CounsellorService } from 'src/counsellor/counsellor.service';
import { Client } from 'src/client/entities/client.entity';
import * as nodemailer from 'nodemailer';
import { join } from 'path';
import { clientSessionTemplate } from 'src/mailTemplates/client-session-booked.template';
import { counsellorSessionTemplate } from 'src/mailTemplates/counsellor-session-booked.template';
import { CounsellorBlock } from 'src/counsellor/entities/counsellor-block.entity';
import { clientSessionCancelledTemplate } from 'src/mailTemplates/client-session-cancelled.template';
import { counsellorSessionCancelledTemplate } from 'src/mailTemplates/counsellor-session-cancelled.template';

enum ClientSlotStatus {
  AVAILABLE = 'AVAILABLE',
  BOOKED = 'BOOKED',
  BUFFER = 'BUFFER',
  BLOCKED = 'BLOCKED',
  PAST = 'PAST',
}

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
      private readonly clientRepository:Repository<Client>,
      @InjectRepository(CounsellorBlock)
      private readonly counsellorBlockRepository:Repository<CounsellorBlock>
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

    if(!client.counsellorId){
      client.counsellorId = createSessionDto.counsellorId;
      await this.clientRepository.save(client);
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
    session.bookingtype,
    "BOOKED"
  ),
  attachments: [
    {
      filename: "safe-minds-logo.png",
      path: join(
        process.cwd(),
        "assests",
        "safe-minds-logo.png",
      ),
      cid: "safe-minds-logo",
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
    session.bookingtype,
    client.department || '',
    client.school || '',
    client.batch || '',
    client.referredBy || '',
    "BOOKED"

  ),
  attachments: [
    {
      filename: "safe-minds-logo.png",
      path: join(
        process.cwd(),
        "assests",
        "safe-minds-logo.png",
      ),
      cid: "safe-minds-logo",
    },
  ],
        });
    
    return await this.sessionsRepository.save(session);
  }
  
  async rescheduleSession(id: string, data: UpdateSessionDto) {
    const session = await this.sessionsRepository.findOne({
      where: { id },
    });
  
    if (!session) {
      throw new NotFoundException("Session not found");
    }
  
    const client = await this.clientRepository.findOne({
      where: { id: session.clientId },
    });
  
    if (!client) {
      throw new NotFoundException("Client not found");
    }
  
    const counsellor = await this.counsellorRepository.findOne({
      where: { id: session.counsellorId },
    });
  
    if (!counsellor) {
      throw new NotFoundException("Counsellor not found");
    }
  
    if (!data.scheduledStartTime) {
      throw new BadRequestException(
        "Scheduled start time is required",
      );
    }
  
    const newStartTime = new Date(data.scheduledStartTime);
  
    if (Number.isNaN(newStartTime.getTime())) {
      throw new BadRequestException(
        "Invalid scheduled start time",
      );
    }
  
    const sessionDuration = counsellor.sessionDuration ?? 45;
  
    const newEndTime = new Date(
      newStartTime.getTime() +
        sessionDuration * 60 * 1000,
    );
  
    const day = newStartTime.getDay();
  
    if (day === 0 || day === 6) {
      throw new BadRequestException(
        "Sessions cannot be scheduled on Saturday or Sunday",
      );
    }
  
    const overlappingSession = await this.sessionsRepository
      .createQueryBuilder("session")
      .where("session.counsellorId = :counsellorId", {
        counsellorId: session.counsellorId,
      })
      .andWhere("session.id != :sessionId", {
        sessionId: session.id,
      })
      .andWhere("session.status IN (:...statuses)", {
        statuses: [
          SessionStatus.BOOKED,
          SessionStatus.RESCHEDULED,
          SessionStatus.ONGOING,
        ],
      })
      .andWhere(
        `
        session.scheduledStartTime < :newEndTime
        AND session.scheduledEndTime > :newStartTime
        `,
        {
          newStartTime,
          newEndTime,
        },
      )
      .getOne();
  
    if (overlappingSession) {
      throw new ConflictException(
        "The counsellor already has a session during this time",
      );
    }
  
    session.scheduledStartTime = newStartTime;
    session.scheduledEndTime = newEndTime;
    session.status = SessionStatus.RESCHEDULED;
  
    const updatedSession =
      await this.sessionsRepository.save(session);

  
    const sessionDate = newStartTime.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "long",
        year: "numeric",
        timeZone: "Asia/Kolkata",
      },
    );
  
    const startTime = newStartTime.toLocaleTimeString(
      "en-IN",
      {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
        timeZone: "Asia/Kolkata",
      },
    );
  
    const endTime = newEndTime.toLocaleTimeString(
      "en-IN",
      {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
        timeZone: "Asia/Kolkata",
      },
    );
  
    const clientName =
      `${client.firstName} ${client.lastName ?? ""}`.trim();
  
    const counsellorName =
      `${counsellor.firstName} ${
        counsellor.lastName ?? ""
      }`.trim();
  
    const clientEmailHtml = clientSessionTemplate(
      clientName,
      counsellorName,
      counsellor.location ?? "Safe Minds",
      sessionDate,
      startTime,
      endTime,
      session.bookingtype,
      "RESCHEDULED",
    );
  
    const counsellorEmailHtml =
      counsellorSessionTemplate(
        counsellorName,
        clientName,
        session.sessionNumber,
        sessionDate,
        startTime,
        endTime,
        session.bookingtype,
        client.department,
        client.school,
        client.batch,
        client.referredBy,
        "RESCHEDULED",
      );

  
    await this.transporter.sendMail({
      to: client.email,
      subject:
        "Your Safe Minds Counselling Session Has Been Rescheduled",
      html: clientEmailHtml,
      attachments: [
        {
          filename: "safe-minds-logo.png",
          path: join(
            process.cwd(),
            "assests",
            "safe-minds-logo.png",
          ),
          cid: "safe-minds-logo",
        },
      ],
    });
  
    await this.transporter.sendMail({
      to: counsellor.email,
      subject: "Counselling Session Rescheduled",
      html: counsellorEmailHtml,
      attachments: [
        {
          filename: "safe-minds-logo.png",
          path: join(
            process.cwd(),
            "assests",
            "safe-minds-logo.png",
          ),
          cid: "safe-minds-logo",
        },
      ],
    });
  
    return {
      message: "Session rescheduled successfully",
      session: updatedSession,
    };
  }

  formatSessionDateTime(time: Date | string) {
    const dateObj = new Date(time);
  
    const day = Number(
      dateObj.toLocaleDateString("en-IN", {
        timeZone: "Asia/Kolkata",
        day: "numeric",
      }),
    );
  
    const month = dateObj.toLocaleDateString("en-IN", {
      timeZone: "Asia/Kolkata",
      month: "short",
    });
  
    const year = dateObj.toLocaleDateString("en-IN", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
    });
  
    const getOrdinal = (day: number) => {
      if (day >= 11 && day <= 13) {
        return "th";
      }
  
      switch (day % 10) {
        case 1:
          return "st";
        case 2:
          return "nd";
        case 3:
          return "rd";
        default:
          return "th";
      }
    };
  
    const startTime = dateObj
      .toLocaleTimeString("en-IN", {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
      .toUpperCase();
  
    return {
      date: `${day}${getOrdinal(day)} ${month} ${year}`,
      startTime,
    };
  }

  async cancelSession(id: string, data: any) { 
    const session: any = await this.sessionsRepository.findOne({
      where: {
        id,
      },
    });
  
    if (!session) {
      throw new NotFoundException("Session not found");
    }
    const client = await this.clientRepository.findOne({
      where: {
        id: session.clientId,
      },
    });
  
    if (!client) {
      throw new NotFoundException("Client not found");
    }
    const counsellor = await this.counsellorRepository.findOne({
      where: {
        id: session.counsellorId,
      },
    });
  
    if (!counsellor) {
      throw new NotFoundException("Counsellor not found");
    }
    if (
      data.role !== "CLIENT" &&
      data.role !== "COUNSELLOR"
    ) {
      throw new BadRequestException(
        "Invalid cancellation role",
      );
    }
    if (
      session.status ===
        SessionStatus.CANCELLED_BY_CLIENT ||
      session.status ===
        SessionStatus.CANCELLED_BY_COUNSELLOR
    ) {
      throw new BadRequestException(
        "Session is already cancelled",
      );
    }
    const statusReason =
      data.statusReason?.trim() || "No reason was provided.";
  
    if (data.role === "CLIENT") {
      session.status =
        SessionStatus.CANCELLED_BY_CLIENT;
    } else {
      session.status =
        SessionStatus.CANCELLED_BY_COUNSELLOR;
    }
    session.statusReason = statusReason;
    await this.sessionsRepository.save(session);
    const temp1 = this.formatSessionDateTime(
      session.scheduledStartTime,
    );
    
    const temp2 = this.formatSessionDateTime(
      session.scheduledEndTime,
    );
    
    const sessionDate = temp1.date;
    const startTime = temp1.startTime;
    const endTime = temp2.startTime;
    const clientEmailHtml =
      clientSessionCancelledTemplate(
        `${client.firstName} ${
          client.lastName ?? ""
        }`.trim(),
  
        `${counsellor.firstName} ${
          counsellor.lastName ?? ""
        }`.trim(),
        sessionDate,
        startTime,
        endTime,
        session.bookingtype,
        data.role,
        statusReason,
        counsellor.location || "",
      );
  
    const counsellorEmailHtml =
      counsellorSessionCancelledTemplate(
        `${counsellor.firstName} ${
          counsellor.lastName ?? ""
        }`.trim(),
  
        `${client.firstName} ${
          client.lastName ?? ""
        }`.trim(),
        sessionDate,
        startTime,
        endTime,
        session.bookingtype,
        data.role,
        statusReason,
        client.department || "",
        client.school || "",
        client.batch || "",
        counsellor.location || "",
      );
  
    await this.transporter.sendMail({
      from: `"Safe Minds" <${process.env.MAIL_USER}>`,
  
      to: client.email,
  
      subject:
        data.role === "CLIENT"
          ? `Hello ${client.firstName}, Your Safe Minds counselling session has been cancelled`
          : `Hello ${client.firstName}, Your Safe Minds counselling session was cancelled by your counsellor`,
  
      html: clientEmailHtml,
  
      attachments: [
        {
          filename: "safe-minds-logo.png",
  
          path: join(
            process.cwd(),
            "assests",
            "safe-minds-logo.png",
          ),
  
          cid: "safe-minds-logo",
        },
      ],
    });
  
    await this.transporter.sendMail({
      from: `"Safe Minds" <${process.env.MAIL_USER}>`,
  
      to: counsellor.email,
  
      subject:
        data.role === "COUNSELLOR"
          ? `Safe Minds - Counselling session cancelled`
          : `Safe Minds - Client cancelled counselling session`,
  
      html: counsellorEmailHtml,
  
      attachments: [
        {
          filename: "safe-minds-logo.png",
  
          path: join(
            process.cwd(),
            "assests",
            "safe-minds-logo.png",
          ),
  
          cid: "safe-minds-logo",
        },
      ],
    });
  
    return {
      message: "Session cancelled successfully",
  
      session: {
        id: session.id,
        status: session.status,
        statusReason: session.statusReason,
        scheduledStartTime:
          session.scheduledStartTime,
        scheduledEndTime:
          session.scheduledEndTime,
      },
    };
  }

  private formatTime(date: Date): string {
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  }


  async getSessionDetails(id:string){
   const sessionData =  await this.sessionsRepository.findOne({where:{id}})
   if (!sessionData) {
    throw new NotFoundException("Session not found");
  }
  const counsellor = await this.counsellorRepository.findOne({where:{id:sessionData.counsellorId}})
  if (!counsellor) {
    throw new NotFoundException("Counsellor not found");
  }

  return {
    id:sessionData.id,
    counsellorName:sessionData.counsellorName,
    counsellorId:counsellor.id,
    startTime: sessionData.scheduledStartTime,
    endTime: sessionData.scheduledEndTime,
          duration: 45,
          bookingType:sessionData.bookingtype,
          location:counsellor.location,
          school:counsellor.school,
          status:sessionData.status
  }
}
  
async getCounsellorAvailability(counsellorId: string) {
  const counsellor = await this.counsellorRepository.findOne({
    where: {
      id: counsellorId,
    },
  });

  if (!counsellor) {
    throw new NotFoundException("Counsellor not found");
  }

  const sessionDuration = counsellor.sessionDuration ?? 45;
  const bufferTime = counsellor.bufferTime ?? 0;

  const MAX_CLIENT_SESSIONS_PER_DAY = 4;

  const CANCELLED_STATUSES = [
    SessionStatus.CANCELLED_BY_CLIENT,
    SessionStatus.CANCELLED_BY_COUNSELLOR,
  ];
  const getIndiaDate = () => {
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "numeric",
      day: "numeric",
    });

    const parts = formatter.formatToParts(new Date());

    return {
      year: Number(
        parts.find((p) => p.type === "year")?.value,
      ),
      month: Number(
        parts.find((p) => p.type === "month")?.value,
      ),
      day: Number(
        parts.find((p) => p.type === "day")?.value,
      ),
    };
  };
  const createIndiaDate = (
    year: number,
    month: number,
    day: number,
    hour: number,
    minute: number,
  ) => {
    const monthString = String(month).padStart(2, "0");
    const dayString = String(day).padStart(2, "0");
    const hourString = String(hour).padStart(2, "0");
    const minuteString = String(minute).padStart(2, "0");

    return new Date(
      `${year}-${monthString}-${dayString}T${hourString}:${minuteString}:00+05:30`,
    );
  };
  const getWeekday = (
    year: number,
    month: number,
    day: number,
  ) => {
    const date = new Date(
      `${year}-${String(month).padStart(
        2,
        "0",
      )}-${String(day).padStart(
        2,
        "0",
      )}T12:00:00+05:30`,
    );

    return new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Kolkata",
      weekday: "short",
    }).format(date);
  };
  let {
    year,
    month,
    day,
  } = getIndiaDate();

  const dates: any[] = [];

  let workingDays = 0;
  while (workingDays < 5) {
    const weekday = getWeekday(
      year,
      month,
      day,
    );
    const isWeekend =
      weekday === "Sat" ||
      weekday === "Sun";

    if (!isWeekend) {
      const dateStart = createIndiaDate(
        year,
        month,
        day,
        0,
        0,
      );
      const nextDayDate = new Date(
        `${year}-${String(month).padStart(
          2,
          "0",
        )}-${String(day).padStart(
          2,
          "0",
        )}T12:00:00+05:30`,
      );

      nextDayDate.setDate(
        nextDayDate.getDate() + 1,
      );

      const nextDayParts =
        new Intl.DateTimeFormat("en-US", {
          timeZone: "Asia/Kolkata",
          year: "numeric",
          month: "numeric",
          day: "numeric",
        }).formatToParts(nextDayDate);

      const nextYear = Number(
        nextDayParts.find(
          (p) => p.type === "year",
        )?.value,
      );

      const nextMonth = Number(
        nextDayParts.find(
          (p) => p.type === "month",
        )?.value,
      );

      const nextDay = Number(
        nextDayParts.find(
          (p) => p.type === "day",
        )?.value,
      );

      const dateEnd = createIndiaDate(
        nextYear,
        nextMonth,
        nextDay,
        0,
        0,
      );
      const sessions =
        await this.sessionsRepository
          .createQueryBuilder("session")
          .where(
            "session.counsellorId = :counsellorId",
            {
              counsellorId,
            },
          )
          .andWhere(
            "session.scheduledStartTime >= :dateStart",
            {
              dateStart,
            },
          )
          .andWhere(
            "session.scheduledStartTime < :dateEnd",
            {
              dateEnd,
            },
          )
          .andWhere(
            "session.status NOT IN (:...cancelledStatuses)",
            {
              cancelledStatuses:
                CANCELLED_STATUSES,
            },
          )
          .orderBy(
            "session.scheduledStartTime",
            "ASC",
          )
          .getMany();
      const blocks =
        await this.counsellorBlockRepository
          .createQueryBuilder("block")
          .where(
            "block.counsellorId = :counsellorId",
            {
              counsellorId,
            },
          )
          .andWhere(
            "block.startTime < :dateEnd",
            {
              dateEnd,
            },
          )
          .andWhere(
            "block.endTime > :dateStart",
            {
              dateStart,
            },
          )
          .getMany();
      const clientSessionCount =
        sessions.filter(
          (session) => !!session.clientId,
        ).length;

      const slots: any[] = [];
      const workingPeriods = [
        {
          startHour: 10,
          startMinute: 0,
          endHour: 13,
          endMinute: 0,
        },
        {
          startHour: 14,
          startMinute: 0,
          endHour: 17,
          endMinute: 0,
        },
      ];

      const now = new Date();
      for (const period of workingPeriods) {
        const periodStart = createIndiaDate(
          year,
          month,
          day,
          period.startHour,
          period.startMinute,
        );

        const periodEnd = createIndiaDate(
          year,
          month,
          day,
          period.endHour,
          period.endMinute,
        );

        let slotStart = new Date(
          periodStart,
        );

        while (true) {
          const slotEnd = new Date(
            slotStart.getTime() +
              sessionDuration * 60 * 1000,
          );
          if (slotEnd > periodEnd) {
            break;
          }

          let status =
            ClientSlotStatus.AVAILABLE;

          let reason: string | null = null;
          if (slotStart <= now) {
            status =
              ClientSlotStatus.PAST;

            reason =
              "SLOT_ALREADY_STARTED";
          }
          if (
            status ===
            ClientSlotStatus.AVAILABLE
          ) {
            const bookedSession =
              sessions.find((session) => {
                const existingStart =
                  new Date(
                    session.scheduledStartTime,
                  );

                const existingEnd =
                  new Date(
                    session.scheduledEndTime,
                  );

                return (
                  existingStart < slotEnd &&
                  existingEnd > slotStart
                );
              });

            if (bookedSession) {
              status =
                ClientSlotStatus.BOOKED;

              reason =
                "SESSION_ALREADY_BOOKED";
            }
          }
          if (
            status ===
            ClientSlotStatus.AVAILABLE
          ) {
            const bufferSession =
              sessions.find((session) => {
                if (!session.requiresBuffer) {
                  return false;
                }
                const existingEnd =
                  new Date(
                    session.scheduledEndTime,
                  );
                const bufferEnd =
                  new Date(
                    existingEnd.getTime() +
                      bufferTime *
                        60 *
                        1000,
                  )
                return (
                  existingEnd <= slotStart &&
                  bufferEnd > slotStart
                );
              });

            if (bufferSession) {
              status =
                ClientSlotStatus.BUFFER;

              reason =
                "BUFFER_AFTER_SESSION";
            }
          }
          if (
            status ===
            ClientSlotStatus.AVAILABLE
          ) {
            const block = blocks.find(
              (block) => {
                const blockStart =
                  new Date(block.startTime);

                const blockEnd =
                  new Date(block.endTime);

                return (
                  blockStart < slotEnd &&
                  blockEnd > slotStart
                );
              },
            );

            if (block) {
              status =
                ClientSlotStatus.BLOCKED;

              reason = block.reason
                ? `COUNSELLOR_BLOCK: ${block.reason}`
                : "COUNSELLOR_BLOCK";
            }
          }
          if (
            status ===
              ClientSlotStatus.AVAILABLE &&
            clientSessionCount >=
              MAX_CLIENT_SESSIONS_PER_DAY
          ) {
            status =
              ClientSlotStatus.BLOCKED;

            reason =
              "DAILY_CLIENT_LIMIT_REACHED";
          }
          slots.push({
            startTime:
              this.formatTime(slotStart),

            endTime:
              this.formatTime(slotEnd),

            status,
            reason,
          });
          slotStart = new Date(
            slotStart.getTime() +
              sessionDuration * 60 * 1000,
          );
        }
      }
      dates.push({
        date: `${year}-${String(month).padStart(
          2,
          "0",
        )}-${String(day).padStart(
          2,
          "0",
        )}`,
        weekday,
        slots,
      });

      workingDays++;
    }
    const currentIndiaDate =
      new Date(
        `${year}-${String(month).padStart(
          2,
          "0",
        )}-${String(day).padStart(
          2,
          "0",
        )}T12:00:00+05:30`,
      );

    currentIndiaDate.setDate(
      currentIndiaDate.getDate() + 1,
    );
    const nextParts =
      new Intl.DateTimeFormat("en-US", {
        timeZone: "Asia/Kolkata",
        year: "numeric",
        month: "numeric",
        day: "numeric",
      }).formatToParts(
        currentIndiaDate,
      );
    year = Number(
      nextParts.find(
        (p) => p.type === "year",
      )?.value,
    );
    month = Number(
      nextParts.find(
        (p) => p.type === "month",
      )?.value,
    );
    day = Number(
      nextParts.find(
        (p) => p.type === "day",
      )?.value,
    );
  }

  return {
    counsellor: {
      name: `${counsellor.firstName} ${counsellor.lastName}`,
      location: counsellor.location,
      school: counsellor.school,
    },
    sessionDuration,
    bufferTime,
    maxClientSessionsPerDay:
      MAX_CLIENT_SESSIONS_PER_DAY,
    dates,
  };
}

async removeAll() {
    const sessions = await this.sessionsRepository.find();
    if (!sessions || sessions.length === 0) {
      throw new NotFoundException('No sessions found to delete.');
    }
    await this.sessionsRepository.remove(sessions);
    return { message: 'All sessions have been deleted.' };
  }

  async getAllClientSessions(id:string){
    const sessions = await this.sessionsRepository.find({
      where: {
        clientId: id,
      },
      order: {
        scheduledStartTime: "ASC",
      },
    });    if(!sessions || sessions.length<1){
      throw new NotFoundException("Sessions Not Found")
    }
    return sessions
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
