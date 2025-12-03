import { Pipe, PipeTransform } from '@angular/core';
import { capitalizeFirstLetter } from '../utils/capitalize-first-letter';

@Pipe({
  name: 'stepCase',
})
export class StepCasePipe implements PipeTransform {
  transform(value: string = ''): string {
    const string = value.replace(/-/g, '<br />');

    return capitalizeFirstLetter(string);
  }
}
