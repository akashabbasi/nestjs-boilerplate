import { 
  registerDecorator, 
  ValidationOptions, 
  ValidatorConstraint, 
  ValidatorConstraintInterface, 
  ValidationArguments 
} from 'class-validator';

@ValidatorConstraint({ async: true })
class IsUpperCamelCaseConstraint implements ValidatorConstraintInterface {
  validate(text: string, args: ValidationArguments) {
    return /^[A-Z][a-z]+(?:[A-Z][a-z]+)*$/.test(text);
  }

  defaultMessage(args: ValidationArguments) {
    return `${args.property} must be in Upper Camel Case format`;
  }
}

export function IsUpperCamelCase(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsUpperCamelCaseConstraint,
    });
  };
}
