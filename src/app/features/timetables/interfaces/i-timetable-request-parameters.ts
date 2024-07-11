import {
  ISubjectForCreateTimeTableWithDoublePeriod,
  ISubjectForCreateTimeTableWithPracticeRoom,
} from '@features/subjects/interfaces';

import { IRequestParameters } from '@core/interfaces';

import { ITimetableUnit } from './i-timetable-unit';

export interface ITimetableRequestParameters {
  id?: string;
  classIds: string[];
  doublePeriodSubjects?: ISubjectForCreateTimeTableWithDoublePeriod[];
  fixedTimetableUnits?: ITimetableUnit[];
  subjectsWithPracticeRoom?: ISubjectForCreateTimeTableWithPracticeRoom[];
  freeTimetableUnits?: ITimetableUnit[];
  maxPeriodPerDay: number;
  minPeriodPerDay: number;
  startYear: number;
  endYear: number;
  semester: number;
}

export interface ITimetableRequestParametersForGet extends IRequestParameters {
  startYear?: number;
  endYear?: number;
  semester?: number;
}
