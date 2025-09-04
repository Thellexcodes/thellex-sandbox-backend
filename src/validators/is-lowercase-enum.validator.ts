// src/validators/is-lowercase-enum.validator.ts

import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

export function IsLowercaseEnum(
  enumType: any,
  validationOptions?: ValidationOptions,
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isLowercaseEnum',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [enumType],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const [enumType] = args.constraints;
          const enumValues = Object.values(enumType);
          return (
            typeof value === 'string' &&
            value === value.toLowerCase() &&
            enumValues.includes(value)
          );
        },
        defaultMessage(args: ValidationArguments) {
          const [enumType] = args.constraints;
          return `${args.property} must be one of: ${Object.values(enumType).join(', ')}`;
        },
      },
    });
  };
}
