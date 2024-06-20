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
    if (
      params.isAssignedHomeroom === false ||
      params.isAssignedHomeroom === true
    ) {
      queryParams = queryParams.set(
        'isAssignedHomeroom',
        params.isAssignedHomeroom
      );
    }
  }
  return queryParams;
}
