import { ITeacher } from '@features/teachers/interfaces';

export interface IClassWithHomeroomTeachers
  extends IClassWithHomeroomTeachersDto {
  id: string;
}

export interface IClassWithHomeroomTeachersDto {
  name?: string;
  homeroomTeacher?: ITeacher;
  homeroomTeacherId?: string;
  startYear?: number;
  endYear?: number;
}
