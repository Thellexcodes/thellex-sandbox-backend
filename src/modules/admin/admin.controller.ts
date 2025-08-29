import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { AdminRoutes } from '@/routes/admint-routes';
import { VersionedController101 } from '../controller/base.controller';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@/middleware/guards/local.auth.guard';
import { SuperAdminGuard } from '@/middleware/guards/super-admin.guard';

@Controller('admin')
@VersionedController101('user')
@UseGuards(AuthGuard, SuperAdminGuard)
@ApiBearerAuth('access-token')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post()
  create(@Body() createAdminDto: CreateAdminDto) {
    return this.adminService.create(createAdminDto);
  }

  @Get(AdminRoutes.AllRampTransactions)
  allRampTransactions() {
    return this.adminService.allRampTransactions();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.adminService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAdminDto: UpdateAdminDto) {
    return this.adminService.update(+id, updateAdminDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.adminService.remove(+id);
  }
}
