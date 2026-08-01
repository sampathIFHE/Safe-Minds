import { PartialType } from '@nestjs/mapped-types';
import { CreateCounsellorBlockDto } from './create-counsellor-block.dto';

export class UpdateCounsellorBlockDto extends PartialType(CreateCounsellorBlockDto) {}