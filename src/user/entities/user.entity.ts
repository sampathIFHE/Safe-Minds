import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

export enum UserRole {
  ADMIN = "ADMIN",
  COUNSELLOR = "COUNSELLOR",
  CLIENT = "CLIENT",
}

@Entity()
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({default: ""})
  firstName: string;

  @Column({default: ""})
  lastName: string;

  @Column({ unique: true , nullable:true})
  email?: string;

  @Column({ unique: true , nullable:true })
  mobile?: string;

  @Column({ unique: true })
  identifier: string;
  
  @Column({
    type: "enum",
    enum: UserRole,
  })
  role: UserRole;

  @Column({ nullable: true })
  otp: string;

  @Column({
    type: "timestamp",
    nullable: true,
  })
  otpExpiresAt!: Date | null;

  @Column({ default: false })
  isVerified: boolean;
}