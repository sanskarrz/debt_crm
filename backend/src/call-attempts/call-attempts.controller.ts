import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { CallAttemptsService } from './call-attempts.service';
import { CreateCallAttemptDto } from './dto/create-call-attempt.dto';
import { UpdateCallAttemptDto } from './dto/update-call-attempt.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CallStatus } from '../database/entities/call-attempt.entity';

@Controller('call-attempts')
@UseGuards(JwtAuthGuard)
export class CallAttemptsController {
  constructor(private readonly callAttemptsService: CallAttemptsService) {}

  @Post()
  create(@Body() createCallAttemptDto: CreateCallAttemptDto) {
    return this.callAttemptsService.create(createCallAttemptDto);
  }

  @Get()
  findAll(@Query('campaignId') campaignId?: string, @Query('agentId') agentId?: string) {
    if (campaignId) {
      return this.callAttemptsService.findByCampaign(campaignId);
    }
    if (agentId) {
      return this.callAttemptsService.findByAgent(agentId);
    }
    return this.callAttemptsService.findAll();
  }

  @Get('stats')
  getStats(@Query('campaignId') campaignId?: string, @Query('agentId') agentId?: string) {
    return this.callAttemptsService.getCallStats(campaignId, agentId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.callAttemptsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCallAttemptDto: UpdateCallAttemptDto) {
    return this.callAttemptsService.update(id, updateCallAttemptDto);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body('status') status: CallStatus) {
    return this.callAttemptsService.updateStatus(id, status);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.callAttemptsService.remove(id);
  }
}

