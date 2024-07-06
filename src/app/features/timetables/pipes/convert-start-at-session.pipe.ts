import { Pipe, PipeTransform } from '@angular/core';

import { IStartAtSession } from '../interfaces';

@Pipe({
  name: 'convertStartAtSession',
  standalone: true,
})
export class ConvertStartAtSessionPipe implements PipeTransform {
  transform(value?: IStartAtSession[]): string {
    return !value ? '' : value.map((x) => x.name).join(', ');
  }
}
