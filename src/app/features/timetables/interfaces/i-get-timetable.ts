import { ITimetableUnit } from './i-timetable-unit';

/* eslint-disable @typescript-eslint/no-explicit-any */
export interface IGetTimetable {
  id: string;
  timetableFlag?: any[];
  timetableUnits?: ITimetableUnit[];
  constraintErrors?: any[];
  adaptability?: any[];
  age?: number;
  longevity?: number;
  startYear?: number;
  endYear?: number;
  semester?: number;
  name?: string;
  classes?: any[];
  teachers?: any[];
}
