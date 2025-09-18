import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { DispositionsService } from './dispositions.service';
import { CreateDispositionDto } from './dto/create-disposition.dto';
import { UpdateDispositionDto } from './dto/update-disposition.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('dispositions')
@UseGuards(JwtAuthGuard)
export class DispositionsController {
  constructor(private readonly dispositionsService: DispositionsService) {}

  @Post()
  create(@Body() createDispositionDto: CreateDispositionDto) {
    return this.dispositionsService.create(createDispositionDto);
  }

  @Get()
  findAll(@Query('campaignId') campaignId?: string, @Query('agentId') agentId?: string) {
    return this.dispositionsService.findAll();
  }

  @Get('stats')
  getStats(@Query('campaignId') campaignId?: string, @Query('agentId') agentId?: string) {
    return this.dispositionsService.getDispositionStats(campaignId, agentId);
  }

  @Get('call-attempt/:callAttemptId')
  findByCallAttempt(@Param('callAttemptId') callAttemptId: string) {
    return this.dispositionsService.findByCallAttempt(callAttemptId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.dispositionsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDispositionDto: UpdateDispositionDto) {
    return this.dispositionsService.update(id, updateDispositionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.dispositionsService.remove(id);
  }
}

