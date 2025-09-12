import { PartialType } from '@nestjs/swagger';
import { CreateFirebaseDto } from './create-firebase.dto';

export class UpdateFirebaseDto extends PartialType(CreateFirebaseDto) {}
