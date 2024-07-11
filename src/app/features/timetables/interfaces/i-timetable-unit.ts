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
  constraintErrors?: any;
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
  constraintErrors?: any;
  isNoAssignTimetableUnits?: boolean;
  isHover?: boolean;
}
