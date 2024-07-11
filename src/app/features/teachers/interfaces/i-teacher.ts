import { ISubjectsTeachers } from '@features/subjects-teachers/interfaces';

export interface ITeacher extends ITeacherDto {
  id: string;
}

export interface ITeacherDto {
  fullName?: string;
  shortName?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  subjectTeachers?: ISubjectsTeachers[];
  periodCount?: number;
}
