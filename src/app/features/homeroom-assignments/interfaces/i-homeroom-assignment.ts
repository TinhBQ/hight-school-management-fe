import { ITeacher } from '@features/teachers/interfaces';

export interface IHomeroomAssignment extends IHomeroomAssignmentDto {
  id: string;
}

export interface IHomeroomAssignmentDto {
  name: string;
  homeroomTeacher?: ITeacher;
  homeroomTeacherId?: string;
  startYear?: number;
  endYear?: number;
}
