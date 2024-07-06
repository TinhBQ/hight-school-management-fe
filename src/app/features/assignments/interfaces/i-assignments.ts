import { IStartAtSession } from '@features/timetables/interfaces';

export interface IAssignment extends IAssignmentDto {
  id: string;
}

export interface IAssignmentDto {
  periodCount?: number;
  schoolShift?: 0 | 1;
  semester?: number;
  startYear?: number;
  endYear?: number;
  teacherId?: string;
  teacherName?: string;
  teacherShortName?: string;
  subjectId?: string;
  subjectName?: string;
  classId?: string;
  className?: string;
}

export interface IAssignmentDtoForEdit {
  id: string;
  periodCount?: number;
  schoolShift?: 0 | 1;
  semester?: number;
  startYear?: number;
  endYear?: number;
  teacherId?: string;
  teacherName?: string;
  teacherShortName?: string;
  subjectId?: string;
  subjectName?: string;
  classId?: string;
  className?: string;
  startAtsAfternoon?: IStartAtSession[];
  startAtsMorning?: IStartAtSession[];
}
