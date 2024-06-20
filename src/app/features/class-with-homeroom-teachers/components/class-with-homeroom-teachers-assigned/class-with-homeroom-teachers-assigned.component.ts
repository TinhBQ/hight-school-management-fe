/* eslint-disable @typescript-eslint/no-explicit-any */
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { TeacherService } from '@features/teachers/services/teacher.service';
import {
  ITeacher,
  ITeachersForClassRequestParameters,
} from '@features/teachers/interfaces';
import { ClassWithHomeroomTeachersService } from '@features/class-with-homeroom-teachers/services';
import { GetFullAndShortNameForTeacherPipe } from '@features/teachers/pipes/get-full-and-short-name-for-teacher.pipe';
import {
  IClassWithHomeroomTeachers,
  IClassWithHomeroomTeachersRequestParameters,
} from '@features/class-with-homeroom-teachers/interfaces';

import { OnInit, Component, ViewChild, ChangeDetectorRef } from '@angular/core';

import { CoreModule } from '@core/core.module';
import { ICusAutoCompleteColumn } from '@core/interfaces/i-column';
import { IColumn, IPagination, IResponseBase } from '@core/interfaces';
import { ConfirmationDialogService } from '@core/services/confirmation-dialog.service';
import { MessageNotificationService } from '@core/services/message-notification.service';

import { SmseduCrudComponent } from '@shared/smsedu-crud/smsedu-crud.component';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'smsedu-class-with-homeroom-teachers-assigned',
  standalone: true,
  imports: [CoreModule, SmseduCrudComponent, GetFullAndShortNameForTeacherPipe],
  templateUrl: './class-with-homeroom-teachers-assigned.component.html',
  providers: [
    ClassWithHomeroomTeachersService,
    TeacherService,
    ConfirmationDialogService,
    MessageNotificationService,
  ],
})
export class ClassWithHomeroomTeachersAssignedComponent implements OnInit {
  // * Properties for form ClassWithHomeroomTeachersAssignedComponent

  result: IResponseBase<IClassWithHomeroomTeachers[]>;

  data: IClassWithHomeroomTeachers[] = [];

  pagination: IPagination;

  loading: boolean = false;

  searchString = '';

  searchText$ = new Subject<string>();

  classWithHomeroomTeachersRequestParameters: IClassWithHomeroomTeachersRequestParameters =
    {
      isAssignedHomeroom: true,
    };

  columns: IColumn[] = [];

  // * Properties for form AutoCompleteColumn

  cusAutoCompleteColumn: ICusAutoCompleteColumn;

  teachesUnAssignedHomeroom: ITeacher[] = [];

  loadingAutoComplete: boolean = false;

  teachersForClassRequestParameters: ITeachersForClassRequestParameters = {
    isAssignedHomeroom: false,
  };

  paginationForTeachesUnAssignedHomeroom: IPagination;

  @ViewChild(SmseduCrudComponent) smseduCrudComponent: SmseduCrudComponent;

  constructor(
    private classWithHomeroomTeachersService: ClassWithHomeroomTeachersService,
    private cdr: ChangeDetectorRef,
    private teacherService: TeacherService,
    private confirmationDialogService: ConfirmationDialogService,
    private messageNotificationService: MessageNotificationService
  ) {}

  ngOnInit(): void {
    this.searchText$
      .pipe(debounceTime(1000), distinctUntilChanged())
      .subscribe((packageName) => {
        this.classWithHomeroomTeachersRequestParameters.searchTerm =
          packageName;
        return this.getClassWithHomeroomTeachers(
          this.classWithHomeroomTeachersRequestParameters
        );
      });

    this.columns = [
      {
        field: 'name',
        header: 'Tên lớp học',
        isSort: true,
      },
      {
        field: 'homeroomTeacher',
        header: 'Giáo viên',
        pipe: new GetFullAndShortNameForTeacherPipe(),
        typeEidt: 'autocomplete',
      },
    ];
  }

  // * --------------------- Load Data for Table --------------------
  onLoadClassWithHomeroomTeachers(event: any): void {
    const { first, rows, sortField, sortOrder } = event;
    this.classWithHomeroomTeachersRequestParameters = {
      pageNumber: first / rows + 1 || null,
      pageSize: rows || null,
      orderBy: sortField
        ? sortOrder == 1
          ? sortField
          : `${sortField} desc`
        : null,
      isAssignedHomeroom: true,
    };

    this.getClassWithHomeroomTeachers(
      this.classWithHomeroomTeachersRequestParameters
    );

    this.cdr.detectChanges(); // Mark for change detection
  }

  getClassWithHomeroomTeachers(
    params?: IClassWithHomeroomTeachersRequestParameters
  ): void {
    this.loading = true;
    this.classWithHomeroomTeachersService.find(params).subscribe(
      (response) => {
        this.result = response.result;
        this.pagination = response.pagination;
        this.data = this.result.data;
        this.loading = false;
      },
      (error) => {
        console.log(error.toString());
        this.loading = false;
      }
    );
  }

  // * --------------------- Handel AutoComplete --------------------

  onCusAutoCompleteColumn(): ICusAutoCompleteColumn {
    return {
      suggestions: this.teachesUnAssignedHomeroom,
      loadData: this.loadDataOnLazyLoad.bind(this),
      onSearch: this.search.bind(this),
      onSelect: this.onSelectTeacher.bind(this),
      onDropdownClick: this.onDropdownClick.bind(this),
    };
  }

  private search(event: any): void {
    if (event.query === '') return;
    const query = event.query;
    this.teachersForClassRequestParameters = {
      pageNumber: null,
      pageSize: null,
      searchTerm: query,
      isAssignedHomeroom: false,
      fields: null,
      orderBy: null,
    };
    this.teachesUnAssignedHomeroom = [];
    this.loadDataTeachesUnAssignedHomeroom(
      this.teachersForClassRequestParameters
    );
  }

  private loadDataOnLazyLoad(event: any) {
    const { first, last } = event;
    const rows = last - first;

    if (
      first + rows >= this.teachesUnAssignedHomeroom.length &&
      this.paginationForTeachesUnAssignedHomeroom.hasNext &&
      !this.loadingAutoComplete
    ) {
      this.teachersForClassRequestParameters.pageNumber =
        this.paginationForTeachesUnAssignedHomeroom.currentPage + 1;
      this.loadDataTeachesUnAssignedHomeroom(
        this.teachersForClassRequestParameters
      );
    }
  }

  private onDropdownClick() {
    this.teachersForClassRequestParameters = {
      isAssignedHomeroom: false,
      searchTerm: null,
      pageNumber: null,
      pageSize: null,
      fields: null,
      orderBy: null,
    };
    this.loadDataTeachesUnAssignedHomeroom(
      this.teachersForClassRequestParameters
    );
  }

  private onSelectTeacher(event, data) {
    this.confirmationDialogService.confirm(event, () => {
      this.classWithHomeroomTeachersService
        .update(data.id, { homeroomTeacherId: event.value.id })
        .subscribe(
          () => {
            this.messageNotificationService.showSuccess(
              'Thêm danh sách lớp tành công!'
            );
          },
          (error) => {
            console.log(error.toString());
            this.messageNotificationService.showError(
              error.message ?? 'Đã xảy ra lỗi.'
            );
          }
        );
    });
  }

  private loadDataTeachesUnAssignedHomeroom(
    teachersForClassRequestParameters: ITeachersForClassRequestParameters
  ): void {
    this.loadingAutoComplete = true;

    this.teacherService.find(teachersForClassRequestParameters).subscribe(
      (response) => {
        if (response.pagination.currentPage === 1) {
          this.teachesUnAssignedHomeroom = response.result.data;
        } else {
          this.teachesUnAssignedHomeroom = [
            ...this.teachesUnAssignedHomeroom,
            ...response.result.data,
          ];
        }
        this.paginationForTeachesUnAssignedHomeroom = response.pagination;
        this.loadingAutoComplete = false;
      },
      (error) => {
        console.log(error.toString());
        this.loadingAutoComplete = false;
      }
    );
  }
}
