import { format } from 'date-fns';
import { parseISO } from 'date-fns/parseISO';

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'convertToVietnameseDate',
  standalone: true,
})
export class ConvertToVietnameseDatePipe implements PipeTransform {
  transform(value?: string): string {
    if (!value) {
      return '';
    }
    const date = parseISO(value);

    const vietnameseDateStr = format(date, 'dd/MM/yyyy');

    return vietnameseDateStr;
  }
}
