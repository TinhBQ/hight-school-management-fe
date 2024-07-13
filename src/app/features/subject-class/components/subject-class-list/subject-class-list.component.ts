/* eslint-disable @typescript-eslint/no-explicit-any */
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { ISubjectClass } from '@features/subject-class/interfaces';
import { SubjectClassService } from '@features/subject-class/services';

import { OnInit, Component, ViewChild } from '@angular/core';

import { CoreModule } from '@core/core.module';
import { ConfirmationDialogService } from '@core/services/confirmation-dialog.service';
import { MessageNotificationService } from '@core/services/message-notification.service';
import {
  IColumn,
  IPagination,
  ICustomAction,
  IResponseBase,
  IRequestParameters,
} from '@core/interfaces';

import { SmseduCrudComponent } from '@shared/smsedu-crud/smsedu-crud.component';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'smsedu-subject-class-list',
  standalone: true,
  imports: [CoreModule, SmseduCrudComponent],
  templateUrl: './subject-class-list.component.html',
  providers: [
    MessageNotificationService,
    ConfirmationDialogService,
    SubjectClassService,
  ],
})
export class SubjectClassListComponent implements OnInit {
  columns: IColumn[] = [];

  result: IResponseBase<ISubjectClass[]>;

  pagination: IPagination;

  requestParameters: IRequestParameters;

  loading = false;

  searchString = '';

  searchText$ = new Subject<string>();

  customActions: ICustomAction[] = [];

  @ViewChild(SmseduCrudComponent)
  smseduCrudComponent: SmseduCrudComponent;

  constructor(
    private subjectClassService: SubjectClassService,
    private messageNotificationService: MessageNotificationService,
    private confirmationDialogService: ConfirmationDialogService
  ) {}

  ngOnInit(): void {
    this.searchText$
      .pipe(debounceTime(1000), distinctUntilChanged())
      .subscribe((packageName) => {
        this.requestParameters.searchTerm = packageName;
        return this.getAllSubjectClass(this.requestParameters);
      });

    this.columns = [
      { field: 'class.name', header: 'Lớp học', isSort: true },
      { field: 'subject.name', header: 'Môn học', isSort: true },
      { field: 'periodCount', header: 'Số tiết/Tuần', isSort: true },
    ];

    this.customActions = [
      {
        label: 'Chỉnh sửa',
        icon: 'pi pi-pencil',
        color: 'success',
        onClick: (evnet: Event, data: any) => {
          console.log(data);
          // this.onShowDialogForEdit(data);
        },
      },
      {
        label: 'Xóa',
        icon: 'pi pi-trash',
        color: 'warning',
        onClick: (evnet: Event, data: any) => {
          console.log(data);

          // this.onDeleteClass(evnet, data);
        },
      },
    ];
  }

  // * --------------------- Load Data Classes for Table --------------------
  onLoadData(event: any): void {
    this.loading = true;
    const { first, rows, sortField, sortOrder } = event;
    this.requestParameters = {
      ...this.requestParameters,
      pageNumber: first / rows + 1 || null,
      pageSize: rows || null,
      orderBy: sortField
        ? sortOrder == 1
          ? sortField
          : `${sortField} desc`
        : null,
    };

    this.getAllSubjectClass(this.requestParameters);
  }

  // * --------------------- Get List Classes for Services --------------------
  private getAllSubjectClass(params?: IRequestParameters): void {
    this.loading = true;
    this.subjectClassService.find(params).subscribe(
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
