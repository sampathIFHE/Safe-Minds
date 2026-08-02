import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
  } from "typeorm";
  
  export enum ClientType {
    STUDENT = "STUDENT",
    EMPLOYEE = "EMPLOYEE",
  }
  
  export enum ClientStatus {
    ACTIVE = "ACTIVE",
    INACTIVE = "INACTIVE",
  }
  
  @Entity("clients")
  export class Client {
    @PrimaryGeneratedColumn("uuid")
    id: string;
  
    @Column({
      type: "enum",
      enum: ClientType,
      default:ClientType.STUDENT
    })
    type: ClientType;
  
    @Column({ nullable: true })
    studentId?: string;
  
    @Column({ nullable: true })
    employeeId?: string;
  
    @Column({ nullable: true })
    counsellorId?: string;
  
    @Column()
    firstName: string;
  
    @Column({ nullable: true })
    lastName?: string;
  
    @Column({ nullable: true })
    email?: string;
  
    @Column({ nullable: true })
    mobile?: string;
  
    @Column({ nullable: true })
    department?: string;
  
    @Column({ nullable: true })
    school?: string;
  
    @Column({ nullable: true })
    batch?: string;
  
    @Column({ nullable: true })
    referredBy?: string;
  
    @Column({
      type: "enum",
      enum: ClientStatus,
      default: ClientStatus.ACTIVE,
    })
    status: ClientStatus;
  
    @Column({ nullable: true, type: "text" })
    notes?: string;
  
    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    updatedAt: Date;

    @Column()
    userId:string;
  }