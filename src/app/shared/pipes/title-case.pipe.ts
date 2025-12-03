import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'titleCase',
})
export class TitleCasePipe implements PipeTransform {
  transform(input: string): string {
    const output = String(input)
      .replace(/^[^A-Za-z0-9]*|[^A-Za-z0-9]*$/g, '')
      .replace(/([a-z])([A-Z])/g, (m, a, b) => `${a}_${b.toLowerCase()}`)
      .replace(/[^A-Za-z0-9]+|_+/g, ' ')
      .toLowerCase();

    return output.charAt(0).toUpperCase() + output.slice(1);
  }
}
