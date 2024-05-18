import { ISubject } from '@features/subjects/interfaces';
import { IClass } from '@features/classes/interfaces/i-class';

export interface ISubjectClass extends ISubjectClassDto {
  id: string;
}

export interface ISubjectClassDto {
  periodCount: number;
  subjectId: string;
  subject?: ISubject;
  classId: string;
  class?: IClass;
}
