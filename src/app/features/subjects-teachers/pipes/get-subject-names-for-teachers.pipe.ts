import { Pipe, PipeTransform } from '@angular/core';

import { ISubjectsTeachers } from '../interfaces';

@Pipe({
  name: 'getSubjectNamesForTeachers',
  standalone: true,
})
export class GetSubjectNamesForTeachersPipe implements PipeTransform {
  transform(values?: ISubjectsTeachers[]): string {
    return values ? values.map((x) => x.subject.name).join(', ') : '';
  }
}
