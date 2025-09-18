import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, UploadedFile, UseInterceptors, Query } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AllocationsService } from './allocations.service';
import { CreateAllocationDto } from './dto/create-allocation.dto';
import { UpdateAllocationDto } from './dto/update-allocation.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('allocations')
@UseGuards(JwtAuthGuard)
export class AllocationsController {
  constructor(private readonly allocationsService: AllocationsService) {}

  @Post()
  create(@Body() createAllocationDto: CreateAllocationDto) {
    return this.allocationsService.create(createAllocationDto);
  }

  @Get()
  findAll(@Query('campaignId') campaignId?: string) {
    return this.allocationsService.findAll(campaignId);
  }

  @Get('next/:agentId')
  getNext(@Param('agentId') agentId: string) {
    return this.allocationsService.getNextAllocation(agentId, '');
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadAllocations(@UploadedFile() file: Express.Multer.File, @Body('campaignId') campaignId: string) {
    return this.allocationsService.uploadAllocations(file, campaignId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.allocationsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAllocationDto: UpdateAllocationDto) {
    return this.allocationsService.update(id, updateAllocationDto);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.allocationsService.updateStatus(id, status as any);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.allocationsService.remove(id);
  }
}

