import { User } from "src/user/entities/user.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity('counsellors')
export class Counsellor {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  employeeId!: string;

  @Column()
  firstName!: string;

  @Column()
  lastName!: string;

  @Column({ unique: true })
  email!: string;

  @Column({ unique: true, nullable: true })
  mobile?: string;

  @Column({
    type: 'enum',
    enum: ['Male', 'Female', 'Other'],
  })
  gender!: string;

  @OneToOne(() => User)
  @JoinColumn()
  user: User;

  @Column({ default: true })
  isActive!: boolean;

  @Column({ type: 'text', nullable: true })
  bio?: string;

  @Column({ nullable: true })
  location?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column()
  userId: string;

  @Column ({default:45})
  sessionDuration: number;

  @Column({default:45})
  bufferTime: number;

  @Column({ type: "text", array: true, nullable: true })
  languages: string[];

  @Column({nullable:true})
  school:string
}