import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { CallbacksService } from './callbacks.service';
import { CreateCallbackDto } from './dto/create-callback.dto';
import { UpdateCallbackDto } from './dto/update-callback.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('callbacks')
@UseGuards(JwtAuthGuard)
export class CallbacksController {
  constructor(private readonly callbacksService: CallbacksService) {}

  @Post()
  create(@Body() createCallbackDto: CreateCallbackDto) {
    return this.callbacksService.create(createCallbackDto);
  }

  @Get()
  findAll(@Query('agentId') agentId?: string, @Query('allocationId') allocationId?: string) {
    if (agentId) {
      return this.callbacksService.findByAgent(agentId);
    }
    if (allocationId) {
      return this.callbacksService.findByAllocation(allocationId);
    }
    return this.callbacksService.findAll();
  }

  @Get('due')
  findDueCallbacks() {
    return this.callbacksService.findDueCallbacks();
  }

  @Get('stats')
  getStats(@Query('agentId') agentId?: string) {
    return this.callbacksService.getCallbackStats(agentId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.callbacksService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCallbackDto: UpdateCallbackDto) {
    return this.callbacksService.update(id, updateCallbackDto);
  }

  @Patch(':id/complete')
  markCompleted(@Param('id') id: string) {
    return this.callbacksService.markCompleted(id);
  }

  @Patch(':id/cancel')
  markCancelled(@Param('id') id: string) {
    return this.callbacksService.markCancelled(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.callbacksService.remove(id);
  }
}

