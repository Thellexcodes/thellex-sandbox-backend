import { PartialType } from '@nestjs/swagger';
import { CreateQwalletDto } from './create-qwallet.dto';

export class UpdateQwalletDto extends PartialType(CreateQwalletDto) {}
