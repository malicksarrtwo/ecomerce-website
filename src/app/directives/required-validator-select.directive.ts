import { Directive,Input } from '@angular/core';
import{Validator,AbstractControl,NG_VALIDATORS} from '@angular/forms';

@Directive({
  selector: '[appRequiredValidatorSelect]',
  providers:[{
    provide: NG_VALIDATORS,
    useExisting: RequiredValidatorSelectDirective,
    multi: true
  }]
})
export class RequiredValidatorSelectDirective implements Validator{
  @Input() appRequiredValidatorSelect: string;
  validate(control: AbstractControl): {[key: string]: any} | null{
    return control.value === this.appRequiredValidatorSelect ? {'defaultSelected': true} : null;
  }


  constructor() { }

}
