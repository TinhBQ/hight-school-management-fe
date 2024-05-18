/* eslint-disable @typescript-eslint/no-explicit-any */
import { ITeacher } from '@features/teachers/interfaces/i-teacher';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { TeacherService } from '@features/teachers/services/teacher.service';

import { CommonModule } from '@angular/common';
import { OnInit, Component, ViewChild } from '@angular/core';

import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { Table, TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { FileUploadModule } from 'primeng/fileupload';

import {
  IPagination,
  IResponseBase,
  IRequestParameters,
} from '@core/interfaces';

@Component({
  selector: 'app-teacher-list',
  standalone: true,
  imports: [
    CommonModule,
    ToolbarModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    FileUploadModule,
  ],
  templateUrl: './teacher-list.component.html',
  providers: [TeacherService],
})
export class TeacherListComponent implements OnInit {
  result: IResponseBase<ITeacher[]>;

  pagination: IPagination;

  requestParameters: IRequestParameters;

  loading = false;

  searchClass = '';

  searchText$ = new Subject<string>();

  isFirstLoad?: boolean;

  constructor(private teacherService: TeacherService) {}

  ngOnInit(): void {
    this.searchText$
      .pipe(debounceTime(1000), distinctUntilChanged())
      .subscribe((packageName) => {
        this.requestParameters.searchTerm = packageName;
        return this.getClasses(this.requestParameters);
      });

    this.getClasses();
    this.isFirstLoad = true;
  }

  @ViewChild('dt', {}) tableEL: Table;

  // * --------------------- Load Data Classes for Table --------------------
  onLoadClasses(event: any): void {
    if (this.isFirstLoad) {
      this.isFirstLoad = false;
      return;
    }

    this.loading = true;
    const { first, rows, sortField, sortOrder } = event;
    this.requestParameters = {
      pageNumber: first / rows + 1 || null,
      pageSize: rows || null,
      orderBy: sortField
        ? sortOrder == 1
          ? sortField
          : `${sortField} desc`
        : null,
    };

    this.getClasses(this.requestParameters);
  }

  // * --------------------- Get List Classes for Services --------------------
  private getClasses(params?: IRequestParameters): void {
    this.loading = true;
    this.teacherService.find(params).subscribe(
      (response) => {
        this.result = response.result;
        this.pagination = response.pagination;
        this.loading = false;
      },
      (error) => {
        console.log(error.toString());
      }
    );
  }

  // * --------------------- Handle Search Item --------------------
  getSearchValue(event: Event): string {
    this.searchClass = (event.target as HTMLInputElement).value;
    return (event.target as HTMLInputElement).value;
  }

  onSearch(packageName: string) {
    this.searchText$.next(packageName);
  }

  // * --------------------- Clear Table --------------------
  clear() {
    this.tableEL.clear();
    this.searchClass = '';
  }
}
