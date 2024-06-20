import { ISubject } from '@features/subjects/interfaces';
import { ITeacher } from '@features/teachers/interfaces';

export interface ISubjectsTeachers extends ISubjectsTeachersDto {
  id: string;
}

export interface ISubjectsTeachersDto {
  isMain?: boolean;
  subject?: ISubject;
  teacher?: ITeacher;
}
