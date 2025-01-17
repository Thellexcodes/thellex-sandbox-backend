import { PartialType } from '@nestjs/swagger';
import { CreateBridgeDto } from './create-bridge.dto';

export class UpdateBridgeDto extends PartialType(CreateBridgeDto) {}
