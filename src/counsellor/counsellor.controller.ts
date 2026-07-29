import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { CounsellorService } from './counsellor.service';
import { CreateCounsellorDto } from './dto/create-counsellor.dto';
import { UpdateCounsellorDto } from './dto/update-counsellor.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('counsellor')
export class CounsellorController {
  constructor(private readonly counsellorService: CounsellorService) {}

  @Post()
  create(@Body() createCounsellorDto: CreateCounsellorDto) {
    return this.counsellorService.create(createCounsellorDto);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  findAll() {
    return this.counsellorService.findAll();
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  findOne(@Param('id') id: string) {
    return this.counsellorService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  update(@Param('id') id: string, @Body() updateCounsellorDto: UpdateCounsellorDto) {
    return this.counsellorService.update(id, updateCounsellorDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  remove(@Param('id') id: string) {
    return this.counsellorService.remove(id);
  }

  @Delete()
  @UseGuards(AuthGuard('jwt'))
  removeAll() {
    return this.counsellorService.removeAll();
  }
}
