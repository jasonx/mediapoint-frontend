import { DatePipe } from '@angular/common';

export class DateFormatted {
  constructor(private datePipe: DatePipe) {}

  getDate(date: string): string | null {
    return isNaN(new Date(date).getTime())
      ? date
      : this.datePipe.transform(date, 'dd/MM/YY');
  }
}
