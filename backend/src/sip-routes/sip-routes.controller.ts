import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { SipRoutesService } from './sip-routes.service';
import { CreateSipRouteDto } from './dto/create-sip-route.dto';
import { UpdateSipRouteDto } from './dto/update-sip-route.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('sip-routes')
@UseGuards(JwtAuthGuard)
export class SipRoutesController {
  constructor(private readonly sipRoutesService: SipRoutesService) {}

  @Post()
  create(@Body() createSipRouteDto: CreateSipRouteDto) {
    return this.sipRoutesService.create(createSipRouteDto);
  }

  @Get()
  findAll() {
    return this.sipRoutesService.findAll();
  }

  @Get('active')
  findActive() {
    return this.sipRoutesService.getActiveRoutes();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sipRoutesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSipRouteDto: UpdateSipRouteDto) {
    return this.sipRoutesService.update(id, updateSipRouteDto);
  }

  @Patch(':id/toggle-active')
  toggleActive(@Param('id') id: string) {
    return this.sipRoutesService.toggleActive(id);
  }

  @Post(':id/test')
  testConnection(@Param('id') id: string) {
    return this.sipRoutesService.testConnection(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.sipRoutesService.remove(id);
  }
}

