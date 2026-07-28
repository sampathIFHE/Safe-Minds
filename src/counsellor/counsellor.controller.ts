import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CounsellorService } from './counsellor.service';
import { CreateCounsellorDto } from './dto/create-counsellor.dto';
import { UpdateCounsellorDto } from './dto/update-counsellor.dto';

@Controller('counsellor')
export class CounsellorController {
  constructor(private readonly counsellorService: CounsellorService) {}

  @Post()
  create(@Body() createCounsellorDto: CreateCounsellorDto) {
    return this.counsellorService.create(createCounsellorDto);
  }

  @Get()
  findAll() {
    return this.counsellorService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.counsellorService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCounsellorDto: UpdateCounsellorDto) {
    return this.counsellorService.update(id, updateCounsellorDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.counsellorService.remove(id);
  }

  @Delete()
  removeAll() {
    return this.counsellorService.removeAll();
  }
}
