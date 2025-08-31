import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  Res,
} from '@nestjs/common';
import { CardManagementService } from './card-management.service';
import { CreateCardManagementDto } from './dto/create-card-management.dto';
import { UpdateCardManagementDto } from './dto/update-card-management.dto';
import { FullAuthGuard } from '@/middleware/guards/local.auth.guard';
import { ApiBody, ApiExcludeController, ApiTags } from '@nestjs/swagger';
import { StellarService } from '../stellar/stellar.service';
import { CustomRequest, CustomResponse } from '@/models/request.types';
import { responseHandler } from '@/utils/helpers';
import { VersionedController101 } from '../controller/base.controller';

@ApiExcludeController()
@ApiTags('Card Management')
@VersionedController101('card-management')
export class CardManagementController {
  constructor(
    private cardManagementService: CardManagementService,
    private stellarService: StellarService,
  ) {}

  @Post()
  @UseGuards(FullAuthGuard)
  @ApiBody({ description: 'Creates virtual for user' })
  async create(
    @Body() createCardManagementDto: CreateCardManagementDto,
    @Req() req: CustomRequest,
    @Res() res: CustomResponse,
  ) {
    const userData = req.user;

    // await this.stellarService.submitTx(createCardManagementDto.signedTx);

    const result = await this.cardManagementService.create({
      ...createCardManagementDto,
      user: userData,
    });

    const { user, ...newCardResult } = result;

    responseHandler(newCardResult, res, req);
  }

  @Get()
  findAll() {
    return this.cardManagementService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cardManagementService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCardManagementDto: UpdateCardManagementDto,
  ) {
    return this.cardManagementService.update(+id, updateCardManagementDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.cardManagementService.remove(+id);
  }
}
