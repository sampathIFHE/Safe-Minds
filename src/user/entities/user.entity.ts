import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

export enum UserRole {
  ADMIN = "ADMIN",
  COUNSELLOR = "COUNSELLOR",
  STUDENT = "STUDENT",
}

@Entity()
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Column({ unique: true })
  mobile: string;

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