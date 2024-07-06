export interface ITimetable extends ITimetableDto {
  id?: string;
}

export interface ITimetableDto {
  name: string;
  description?: string;
  schoolYearId?: string;
  schoolYearName?: string;
  schoolShiftId?: string;
}
