import { PartialType } from '@nestjs/swagger';
import { CreateQwalletHookDto } from './create-qwallet-hook.dto';

export class UpdateQwalletHookDto extends PartialType(CreateQwalletHookDto) {}
