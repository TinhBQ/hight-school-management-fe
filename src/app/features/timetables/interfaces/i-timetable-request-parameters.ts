import {
  ISubjectForCreateTimeTableWithDoublePeriod,
  ISubjectForCreateTimeTableWithPracticeRoom,
} from '@features/subjects/interfaces';

import { ITimetableUnit } from './i-timetable-unit';

export interface ITimetableRequestParameters {
  classIds: string[];
  doublePeriodSubjects?: ISubjectForCreateTimeTableWithDoublePeriod[];
  fixedTimetableUnits?: ITimetableUnit[];
  subjectsWithPracticeRoom?: ISubjectForCreateTimeTableWithPracticeRoom[];
  noAssignTimetableUnits?: ITimetableUnit[];
  maxPeriodPerDay: number;
  minPeriodPerDay: number;
  startYear: number;
  endYear: number;
  semester: number;
}
