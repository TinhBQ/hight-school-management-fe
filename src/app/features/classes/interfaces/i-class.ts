import { ITeacher } from '@features/teachers/interfaces';
import { ISubjectClass } from '@features/subject-class/interfaces';

export interface IClass extends IClassDto {
  id: string;
}

export interface IClassDto {
  grade?: 10 | 11 | 12;
  schoolShift?: 0 | 1;
  name: string;
  homeroomTeacher?: ITeacher;
  startYear?: number;
  endYear?: number;
  periodCount?: number;
  noAssignTimetableUnits?: number;
  subjectClasses?: ISubjectClass[];
}
