import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { DncService } from './dnc.service';
import { CreateDncNumberDto } from './dto/create-dnc-number.dto';
import { UpdateDncNumberDto } from './dto/update-dnc-number.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('dnc')
@UseGuards(JwtAuthGuard)
export class DncController {
  constructor(private readonly dncService: DncService) {}

  @Post()
  create(@Body() createDncNumberDto: CreateDncNumberDto, @Request() req) {
    return this.dncService.create({
      ...createDncNumberDto,
      addedById: req.user.id,
    });
  }

  @Post('bulk')
  bulkAdd(@Body() body: { phoneNumbers: string[]; reason: string }, @Request() req) {
    return this.dncService.bulkAdd(body.phoneNumbers, body.reason, req.user.id);
  }

  @Get()
  findAll() {
    return this.dncService.findAll();
  }

  @Get('stats')
  getStats() {
    return this.dncService.getDncStats();
  }

  @Get('check/:phoneNumber')
  checkNumber(@Param('phoneNumber') phoneNumber: string) {
    return this.dncService.isDncNumber(phoneNumber);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.dncService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDncNumberDto: UpdateDncNumberDto) {
    return this.dncService.update(id, updateDncNumberDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.dncService.remove(id);
  }

  @Delete('phone/:phoneNumber')
  removeByPhoneNumber(@Param('phoneNumber') phoneNumber: string) {
    return this.dncService.removeByPhoneNumber(phoneNumber);
  }
}

