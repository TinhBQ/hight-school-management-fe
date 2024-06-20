/* eslint-disable @typescript-eslint/no-explicit-any */
import { ISubject } from '@features/subjects/interfaces';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { SubjectService } from '@features/subjects/services/subject.service';

import { CommonModule } from '@angular/common';
import { OnInit, Component, ViewChild } from '@angular/core';

import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { Table, TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { FileUploadModule } from 'primeng/fileupload';

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

import { SubjectDialogForCreateUpdateComponent } from '../subject-dialog-for-create-update/subject-dialog-for-create-update.component';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'smsedu-subject-list',
  standalone: true,
  imports: [
    CommonModule,
    ToolbarModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    FileUploadModule,
    SubjectDialogForCreateUpdateComponent,
    SmseduCrudComponent,
  ],
  templateUrl: './subject-list.component.html',
  providers: [
    SubjectService,
    MessageNotificationService,
    ConfirmationDialogService,
  ],
})
export class SubjectListComponent implements OnInit {
  columns: IColumn[] = [];

  result: IResponseBase<ISubject[]>;

  pagination: IPagination;

  requestParameters: IRequestParameters;

  loading = false;

  searchClass = '';

  searchText$ = new Subject<string>();

  customActions: ICustomAction[] = [];

  @ViewChild(SubjectDialogForCreateUpdateComponent)
  subjectDialogForCreateUpdateComponent: SubjectDialogForCreateUpdateComponent;

  @ViewChild(SmseduCrudComponent)
  smseduCrudComponent: SmseduCrudComponent;

  constructor(
    private subjectService: SubjectService,
    private messageNotificationService: MessageNotificationService,
    private confirmationDialogService: ConfirmationDialogService
  ) {}

  ngOnInit(): void {
    this.searchText$
      .pipe(debounceTime(1000), distinctUntilChanged())
      .subscribe((packageName) => {
        this.requestParameters.searchTerm = packageName;
        return this.getClasses(this.requestParameters);
      });

    this.getClasses();

    this.columns = [
      { field: 'name', header: 'Môn học', isSort: true },
      { field: 'shortName', header: 'Ký hiệu', isSort: true },
    ];

    this.customActions = [
      {
        label: 'Chỉnh sửa',
        icon: 'pi pi-pencil',
        color: 'success',
        onClick: (evnet: Event, data: any) => {
          this.onShowDialogForEdit(data);
        },
      },
      {
        label: 'Xóa',
        icon: 'pi pi-trash',
        color: 'warning',
        onClick: (evnet: Event, data: any) => {
          this.onDeleteClass(evnet, data);
        },
      },
    ];
  }

  @ViewChild('dt', {}) tableEL: Table;

  // * --------------------- Load Data Classes for Table --------------------
  onLoadClasses(event: any): void {
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
    this.subjectService.find(params).subscribe(
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

  onShowDialogForCreate(): void {
    this.subjectDialogForCreateUpdateComponent.subjectForm.setValue({
      id: null,
      name: null,
      shortName: null,
    });
    this.subjectDialogForCreateUpdateComponent.subjectDialog = true;
  }

  onShowDialogForEdit(subject: ISubject): void {
    this.subjectDialogForCreateUpdateComponent.subjectForm.setValue({
      id: subject.id,
      name: subject.name,
      shortName: subject.shortName,
    });

    this.subjectDialogForCreateUpdateComponent.subjectDialog = true;
  }

  onSave(): void {
    if (this.subjectDialogForCreateUpdateComponent.subjectForm.valid) {
      // ! Update class
      if (this.subjectDialogForCreateUpdateComponent.subjectForm.value.id) {
        this.subjectDialogForCreateUpdateComponent.onSetSubjectDTO();
        this.subjectService
          .update(
            this.subjectDialogForCreateUpdateComponent.subjectForm.value.id,
            this.subjectDialogForCreateUpdateComponent.subjectDto
          )
          .subscribe(
            () => {
              this.smseduCrudComponent.onclear();
              this.subjectDialogForCreateUpdateComponent.onHideDialog();
              this.messageNotificationService.showSuccess(
                `Cập nhật môn học ${this.subjectDialogForCreateUpdateComponent.subjectForm.value.name} thành công!`
              );
            },
            (error) => {
              console.log(error.toString());
              this.messageNotificationService.showError(
                error.message ?? 'Đã xảy ra lỗi.'
              );
            }
          );
      } else {
        // ! Create class
        this.subjectDialogForCreateUpdateComponent.onSetSubjectDTO();
        this.subjectService
          .create(this.subjectDialogForCreateUpdateComponent.subjectDto)
          .subscribe(
            () => {
              this.smseduCrudComponent.onclear();
              this.subjectDialogForCreateUpdateComponent.onHideDialog();
              this.messageNotificationService.showSuccess(
                `Thêm  môn học ${this.subjectDialogForCreateUpdateComponent.subjectForm.value.name} thành công!`
              );
            },
            (error) => {
              console.log(error.toString());
              this.messageNotificationService.showError(
                error.message ?? 'Đã xảy ra lỗi.'
              );
            }
          );
      }
    }
  }

  onDeleteClass(event: Event, subject: ISubject): void {
    this.confirmationDialogService.confirm(event, () => {
      this.subjectService.delete(subject.id).subscribe(
        () => {
          this.smseduCrudComponent.onclear();
          this.messageNotificationService.showSuccess(
            `Xóa môn học  ${subject.name} thành công!`
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

  onDeleteClasses(event: Event, selectedSubjects: ISubject[]): void {
    if (selectedSubjects.length > 0) {
      this.confirmationDialogService.confirm(event, () => {
        this.subjectService
          .deleteByIds(selectedSubjects.map((x) => x.id))
          .subscribe(
            () => {
              this.messageNotificationService.showSuccess(
                `Xóa ${selectedSubjects.length} môn học: ${selectedSubjects.map((x) => x.name).join(', ')} thành công!`
              );
              this.smseduCrudComponent.onclear();
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
  }
}
