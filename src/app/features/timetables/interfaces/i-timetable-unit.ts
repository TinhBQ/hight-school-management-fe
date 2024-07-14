import { IConstraintError } from './i-constraint-error';

/* eslint-disable @typescript-eslint/no-explicit-any */
export interface ITimetableUnit extends ITimetableUnitDto {
  id?: string;
}

export interface ITimetableUnitDto {
  priority?: number;
  classId?: string;
  className?: string;
  teacherId?: string;
  teacherName?: string;
  subjectId?: string;
  subjectName?: string;
  startAt: number;
  constraintErrors?: IConstraintError[];
}

export interface ITimetableUnitForEditDto {
  assignmentId?: string;
  priority?: number;
  classId: string;
  className: string;
  teacherId?: string;
  teacherName?: string;
  subjectId?: string;
  subjectName?: string;
  startAt: number;
  constraintErrors?: IConstraintError[];
  isNoAssignTimetableUnits?: boolean;
  isHover?: boolean;
}
