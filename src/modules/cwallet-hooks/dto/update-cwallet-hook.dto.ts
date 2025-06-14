import { PartialType } from '@nestjs/swagger';
import { CreateCwalletHookDto } from './create-cwallet-hook.dto';

export class UpdateCwalletHookDto extends PartialType(CreateCwalletHookDto) {}
