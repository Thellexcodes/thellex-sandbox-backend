import { PartialType } from '@nestjs/swagger';
import { CreateWalletManagerDto } from './create-wallet-manager.dto';

export class UpdateWalletManagerDto extends PartialType(CreateWalletManagerDto) {}
