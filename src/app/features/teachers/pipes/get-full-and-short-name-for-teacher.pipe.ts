import { Pipe, PipeTransform } from '@angular/core';

import { ITeacher } from '../interfaces';

@Pipe({
  name: 'getFullAndShortNameForTeacher',
  standalone: true,
})
export class GetFullAndShortNameForTeacherPipe implements PipeTransform {
  transform(value?: ITeacher): string {
    return !value ? '' : value.fullName + ' (' + value.shortName + ')';
  }
}
