import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { CounsellorService } from './counsellor.service';
import { CreateCounsellorDto } from './dto/create-counsellor.dto';
import { UpdateCounsellorDto } from './dto/update-counsellor.dto';
import { CreateCounsellorBlockDto } from './dto/create-counsellor-block.dto';
import { UpdateCounsellorBlockDto } from './dto/update-counsellor-block.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('counsellor')
export class CounsellorController {
  constructor(private readonly counsellorService: CounsellorService) { }

  @Post()
  create(@Body() createCounsellorDto: CreateCounsellorDto) {
    return this.counsellorService.create(createCounsellorDto);
  }

  @Post(':id/blocks')
  @UseGuards(AuthGuard('jwt'))
  createBlock(
    @Param('id') counsellorId: string,
    @Body() dto: CreateCounsellorBlockDto
  ) {

    return this.counsellorService.createBlock(
      counsellorId,
      dto
    );

  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  findAll() {
    return this.counsellorService.findAll();
  }

  @Get(':id/blocks')
  @UseGuards(AuthGuard('jwt'))
  getBlocks(
    @Param('id') counsellorId: string
  ) {
    return this.counsellorService.getBlocks(
      counsellorId
    );
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  findOne(@Param('id') id: string) {
    return this.counsellorService.findOne(id);
  }

  @Get('/blocks/:blockId')
  @UseGuards(AuthGuard('jwt'))
  getBlockById(
    @Param('blockId') blockId: string,
  ) {
    return this.counsellorService.getBlockById(blockId);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  update(@Param('id') id: string, @Body() updateCounsellorDto: UpdateCounsellorDto) {
   return this.counsellorService.update(id, updateCounsellorDto);
  }

  @Patch(':id/blocks/:blockId')
  @UseGuards(AuthGuard('jwt'))
  updateBlock(
    @Param('id') counsellorId: string,
    @Param('blockId') blockId: string,
    @Body() dto: UpdateCounsellorBlockDto

  ) {
    return this.counsellorService.updateBlock(counsellorId,blockId,dto );
  }
  @Delete('blocks')
  @UseGuards(AuthGuard('jwt'))
  removeAllBlock() {
    return this.counsellorService.removeAllBlock();
  }

  @Delete('blocks/:blockId')
  @UseGuards(AuthGuard('jwt'))
  deleteBlock(
    @Param('blockId') blockId: string
  ) {
    return this.counsellorService.deleteBlock(
      blockId
    );
  }

  @Delete()
  @UseGuards(AuthGuard('jwt'))
  removeAll() {
    return this.counsellorService.removeAll();
  }
  
  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  remove(@Param('id') id: string) {
    return this.counsellorService.remove(id);
  }

 


 
}
