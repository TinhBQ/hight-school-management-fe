export interface ITeacher extends ITeacherDto {
  id: string;
}

export interface ITeacherDto {
  grade: 10 | 11 | 12;
  schoolShift: 0 | 1;
  name: string;
  startYear: number;
  endYear: number;
  periodCount: number;
}
