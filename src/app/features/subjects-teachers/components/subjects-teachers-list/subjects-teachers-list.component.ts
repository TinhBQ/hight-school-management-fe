/* eslint-disable @typescript-eslint/no-explicit-any */
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { ISubjectsTeachers } from '@features/subjects-teachers/interfaces';
import { SubjectsTeachersService } from '@features/subjects-teachers/services/subjects-teachers.service';

import {
  OnInit,
  Component,
  ViewChild,
  AfterViewInit,
  ChangeDetectorRef,
} from '@angular/core';

import { AppComponent } from 'src/app/app.component';

import { CoreModule } from '@core/core.module';
import { ConfirmationDialogService } from '@core/services/confirmation-dialog.service';
import { MessageNotificationService } from '@core/services/message-notification.service';
import {
  IColumn,
  IPagination,
  IResponseBase,
  ICustomAction,
  IRequestParameters,
} from '@core/interfaces';

import { SmseduCrudComponent } from '@shared/smsedu-crud/smsedu-crud.component';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'smsedu-subjects-teachers-list',
  standalone: true,
  imports: [CoreModule, SmseduCrudComponent],
  templateUrl: './subjects-teachers-list.component.html',
  providers: [
    SubjectsTeachersService,
    MessageNotificationService,
    ConfirmationDialogService,
  ],
})
export class SubjectsTeachersListComponent implements OnInit, AfterViewInit {
  columns: IColumn[] = [];

  result: IResponseBase<ISubjectsTeachers[]>;

  pagination: IPagination;

  requestParameters: IRequestParameters;

  loading = false;

  searchString = '';

  searchText$ = new Subject<string>();

  customActions: ICustomAction[] = [];

  @ViewChild(SmseduCrudComponent)
  smseduCrudComponent: SmseduCrudComponent;

  constructor(
    private subjectsTeachersService: SubjectsTeachersService,
    private messageNotificationService: MessageNotificationService,
    private confirmationDialogService: ConfirmationDialogService,
    private cdr: ChangeDetectorRef,
    public app: AppComponent
  ) {}

  ngOnInit(): void {
    this.searchText$
      .pipe(debounceTime(1000), distinctUntilChanged())
      .subscribe((packageName) => {
        this.requestParameters.searchTerm = packageName;
        return this.getAllSubjectTeacher(this.requestParameters);
      });

    this.columns = [
      { field: 'teacher.fullName', header: 'Giáo viên', isSort: true },
      { field: 'subject.name', header: 'Môn học', isSort: true },
      { field: 'isMain', header: 'Môn chính', isSort: true },
    ];

    this.customActions = [
      {
        label: 'Chỉnh sửa',
        icon: 'pi pi-pencil',
        color: 'success',
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        onClick: (evnet: Event, data: any) => {
          // console.log(data);
          // this.onShowDialogForEdit(data);
        },
      },
      {
        label: 'Xóa',
        icon: 'pi pi-trash',
        color: 'warning',
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        onClick: (evnet: Event, data: any) => {
          // console.log(data);
          // this.onDeleteClass(evnet, data);
        },
      },
    ];
  }

  ngAfterViewInit(): void {
    this.cdr.detectChanges();
  }

  // * --------------------- Load Data Classes for Table --------------------
  onLoadData(event: any): void {
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

    this.getAllSubjectTeacher(this.requestParameters);
  }

  // * --------------------- Get List Classes for Services --------------------
  private getAllSubjectTeacher(params?: IRequestParameters): void {
    this.loading = true;
    this.subjectsTeachersService.find(params).subscribe(
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
}
