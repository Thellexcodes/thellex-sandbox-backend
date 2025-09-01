import { CreateSwapValidationErrors } from '@/v1/models/swap-error.enum';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Validate,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'EitherFromOrToAmount', async: false })
export class EitherFromOrToAmountConstraint
  implements ValidatorConstraintInterface
{
  validate(_: any, args: ValidationArguments) {
    const obj = args.object as any;
    return !!(obj.from_amount || obj.to_amount);
  }

  defaultMessage(_: ValidationArguments) {
    return CreateSwapValidationErrors.EitherFromOrToAmountRequired;
  }
}

export class CreateSwapDto {
  @IsString({ message: CreateSwapValidationErrors.UserIdRequired })
  @IsNotEmpty({ message: CreateSwapValidationErrors.UserIdRequired })
  user_id: string;

  @IsString({ message: CreateSwapValidationErrors.FromCurrencyRequired })
  @IsNotEmpty({ message: CreateSwapValidationErrors.FromCurrencyRequired })
  from_currency: string;

  @IsString({ message: CreateSwapValidationErrors.ToCurrencyRequired })
  @IsNotEmpty({ message: CreateSwapValidationErrors.ToCurrencyRequired })
  to_currency: string;

  @IsString({ message: CreateSwapValidationErrors.FromAmountInvalid })
  @IsOptional()
  from_amount?: string;

  @IsString({ message: CreateSwapValidationErrors.ToAmountInvalid })
  @IsOptional()
  to_amount?: string;

  @Validate(EitherFromOrToAmountConstraint)
  validateAmountFields!: boolean;
}
