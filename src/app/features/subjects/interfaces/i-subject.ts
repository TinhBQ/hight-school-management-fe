import { IClass } from '@features/classes/interfaces';
import { ITeacher } from '@features/teachers/interfaces';
import { IStartAtSession } from '@features/timetables/interfaces';

export interface ISubject extends ISubjectDto {
  id: string;
}

export interface ISubjectDto {
  name: string;
  shortName: string;
}

export interface ISubjectForCreateTimeTableWithGeneral {
  subject: ISubject;
  classTeachers: IClassTeacher[];
  startAtsAfternoon?: IStartAtSession[];
  startAtsMorning?: IStartAtSession[];
  periodCount: number;
}

export interface IClassTeacher {
  class: IClass;
  teacher: ITeacher;
}

export interface ISubjectForCreateTimeTableWithDoublePeriod extends ISubject {
  isDoublePeriodSubjects: boolean;
}

export interface ISubjectForCreateTimeTableWithPracticeRoom extends ISubject {
  roomCount: number;
}
