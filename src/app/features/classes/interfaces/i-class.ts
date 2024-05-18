export interface IClass extends IClassDto {
  id?: string;
}

export interface IClassDto {
  grade: 10 | 11 | 12;
  schoolShift: 0 | 1;
  name: string;
  startYear: number;
  endYear: number;
}
