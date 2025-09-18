import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { GsmRoutesService } from './gsm-routes.service';
import { CreateGsmRouteDto } from './dto/create-gsm-route.dto';
import { UpdateGsmRouteDto } from './dto/update-gsm-route.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('gsm-routes')
@UseGuards(JwtAuthGuard)
export class GsmRoutesController {
  constructor(private readonly gsmRoutesService: GsmRoutesService) {}

  @Post()
  create(@Body() createGsmRouteDto: CreateGsmRouteDto) {
    return this.gsmRoutesService.create(createGsmRouteDto);
  }

  @Get()
  findAll() {
    return this.gsmRoutesService.findAll();
  }

  @Get('active')
  findActive() {
    return this.gsmRoutesService.getActiveRoutes();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.gsmRoutesService.findOne(id);
  }

  @Get(':id/channels')
  getChannelStatus(@Param('id') id: string) {
    return this.gsmRoutesService.getChannelStatus(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateGsmRouteDto: UpdateGsmRouteDto) {
    return this.gsmRoutesService.update(id, updateGsmRouteDto);
  }

  @Patch(':id/toggle-active')
  toggleActive(@Param('id') id: string) {
    return this.gsmRoutesService.toggleActive(id);
  }

  @Post(':id/test')
  testConnection(@Param('id') id: string) {
    return this.gsmRoutesService.testConnection(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.gsmRoutesService.remove(id);
  }
}

