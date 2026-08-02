import {
    IsEnum,
    IsOptional,
    IsString,
    IsEmail,
  } from "class-validator";
  
  import { ClientType } from "../entities/client.entity";
  
  export class CreateClientDto {
  
    @IsEnum(ClientType)
    type: ClientType;
  
    @IsOptional()
    @IsString()
    studentId?: string;
  
    @IsOptional()
    @IsString()
    employeeId?: string;
  
    @IsOptional()
    @IsString()
    counsellorId?: string;
  
    @IsString()
  firstName: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  
    @IsOptional()
    @IsEmail()
    email?: string;
  
    @IsOptional()
    @IsString()
    mobile?: string;
  
    @IsOptional()
    @IsString()
    department?: string;
  
    @IsOptional()
    @IsString()
    school?: string;
  
    @IsOptional()
    @IsString()
    batch?: string;
  
    @IsOptional()
    @IsString()
    referredBy?: string;
  
    @IsOptional()
    @IsString()
    notes?: string;

    @IsString()
    userId:string;
  }