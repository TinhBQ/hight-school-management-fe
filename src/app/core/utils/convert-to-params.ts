/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpParams } from '@angular/common/http';

export function convertToParams(params: any): HttpParams {
  let queryParams = new HttpParams();
  if (params) {
    if (params.searchTerm) {
      queryParams = queryParams.set(
        'searchTerm',
        params.searchTerm.trim().toString()
      );
    }
    if (params.pageNumber) {
      queryParams = queryParams.set('pageNumber', params.pageNumber.toString());
    }
    if (params.pageSize) {
      queryParams = queryParams.set('pageSize', params.pageSize.toString());
    }
    if (params.fields) {
      queryParams = queryParams.set('fields', params.fields);
    }
    if (params.orderBy) {
      queryParams = queryParams.set('orderBy', params.orderBy);
    }
    if (params.teacherId) {
      queryParams = queryParams.set('teacherId', params.teacherId);
    }
    if (
      params.isAssignedHomeroom === false ||
      params.isAssignedHomeroom === true
    ) {
      queryParams = queryParams.set(
        'isAssignedHomeroom',
        params.isAssignedHomeroom
      );
    }

    if (params.isNotAssigned === false || params.isNotAssigned === true) {
      console.log('BQT', params.isNotAssigned);
      queryParams = queryParams.set('isNotAssigned', params.isNotAssigned);
    }

    if (params.startYear) {
      queryParams = queryParams.set('startYear', params.startYear);
    }
    if (params.endYear) {
      queryParams = queryParams.set('endYear', params.endYear);
    }

    if (params.semester) {
      queryParams = queryParams.set('semester', params.semester);
    }

    if (params.classIds) {
      queryParams = queryParams.set('classIds', params.classIds);
    }

    if (params.doublePeriodSubjects) {
      queryParams = queryParams.set(
        'doublePeriodSubjects',
        params.doublePeriodSubjects
      );
    }

    if (params.fixedTimetableUnits) {
      queryParams = queryParams.set(
        'fixedTimetableUnits',
        params.fixedTimetableUnits
      );
    }

    if (params.subjectsWithPracticeRoom) {
      queryParams = queryParams.set(
        'subjectsWithPracticeRoom',
        params.subjectsWithPracticeRoom
      );
    }

    if (params.maxPeriodPerDay) {
      queryParams = queryParams.set('maxPeriodPerDay', params.maxPeriodPerDay);
    }

    if (params.minPeriodPerDay) {
      queryParams = queryParams.set('minPeriodPerDay', params.minPeriodPerDay);
    }
  }
  return queryParams;
}
