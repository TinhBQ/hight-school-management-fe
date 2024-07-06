/* eslint-disable @typescript-eslint/no-explicit-any */
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { ITeacher } from '@features/teachers/interfaces/i-teacher';
import { TeacherService } from '@features/teachers/services/teacher.service';
import { GetSubjectNamesForTeachersPipe } from '@features/subjects-teachers/pipes/get-subject-names-for-teachers.pipe';
import { SubjectsForTeacherComponent } from '@features/subjects-teachers/components/subjects-for-teacher/subjects-for-teacher.component';

import { OnInit, Component, ViewChild } from '@angular/core';

import {
  DialogService,
  DynamicDialogRef,
  DynamicDialogModule,
} from 'primeng/dynamicdialog';

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

import { TeacherDialogForCreateUpdateComponent } from '../teacher-dialog-for-create-update/teacher-dialog-for-create-update.component';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'smsedu-teacher-list',
  standalone: true,
  imports: [
    CoreModule,
    SmseduCrudComponent,
    DynamicDialogModule,
    GetSubjectNamesForTeachersPipe,
    TeacherDialogForCreateUpdateComponent,
  ],
  templateUrl: './teacher-list.component.html',
  providers: [
    MessageNotificationService,
    ConfirmationDialogService,
    TeacherService,
    DialogService,
  ],
})
export class TeacherListComponent implements OnInit {
  columns: IColumn[] = [];

  result: IResponseBase<ITeacher[]>;

  pagination: IPagination;

  requestParameters: IRequestParameters;

  loading = false;

  searchClass = '';

  searchText$ = new Subject<string>();

  customActions: ICustomAction[] = [];

  ref: DynamicDialogRef | undefined;

  @ViewChild(SmseduCrudComponent)
  smseduCrudComponent: SmseduCrudComponent;

  @ViewChild(TeacherDialogForCreateUpdateComponent)
  teacherDialogForCreateUpdateComponent: TeacherDialogForCreateUpdateComponent;

  constructor(
    private teacherService: TeacherService,
    private messageNotificationService: MessageNotificationService,
    private confirmationDialogService: ConfirmationDialogService,
    public dialogService: DialogService
  ) {}

  ngOnInit(): void {
    this.searchText$
      .pipe(debounceTime(1000), distinctUntilChanged())
      .subscribe((packageName) => {
        this.requestParameters.searchTerm = packageName;
        return this.getTeachers(this.requestParameters);
      });
    this.getTeachers();

    this.columns = [
      { field: 'fullName', header: 'Họ và tên', isSort: true },
      { field: 'shortName', header: 'Ký hiệu', isSort: true },
      {
        field: 'subjectTeachers',
        header: 'Môn Giảng dạy',
        pipe: new GetSubjectNamesForTeachersPipe(),
        isSort: false,
      },
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
        label: 'Chỉnh sửa phân công môn học',
        icon: 'pi pi-file-edit',
        color: 'blue',
        onClick: (evnet: Event, data: any) => {
          this.ref = this.dialogService.open(SubjectsForTeacherComponent, {
            header: `Danh sách phân công môn học của Giao viên ${data.fullName}`,
            width: '90%',
            maximizable: true,
            data: {
              teacherId: data.id,
            },
            contentStyle: { overflow: 'auto' },
          });
        },
      },
      {
        label: 'Xóa',
        icon: 'pi pi-trash',
        color: 'warning',
        onClick: (evnet: Event, data: any) => {
          this.onDelete(evnet, data);
        },
      },
    ];
  }

  onLoadTeachers(event: any): void {
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

    this.getTeachers(this.requestParameters);
  }

  private getTeachers(params?: IRequestParameters): void {
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

  onShowDialogForCreate(): void {
    this.teacherDialogForCreateUpdateComponent.formGroup.setValue({
      id: null,
      fullName: null,
      shortName: null,
    });
    this.teacherDialogForCreateUpdateComponent.dialog = true;
  }

  onShowDialogForEdit(teacher: ITeacher): void {
    this.teacherDialogForCreateUpdateComponent.formGroup.setValue({
      id: teacher.id,
      fullName: teacher.fullName,
      shortName: teacher.shortName,
    });

    this.teacherDialogForCreateUpdateComponent.dialog = true;
  }

  onSave(): void {
    if (this.teacherDialogForCreateUpdateComponent.formGroup.valid) {
      // ! Update class
      if (this.teacherDialogForCreateUpdateComponent.formGroup.value.id) {
        this.teacherDialogForCreateUpdateComponent.onSetDTO();
        this.teacherService
          .update(
            this.teacherDialogForCreateUpdateComponent.formGroup.value.id,
            this.teacherDialogForCreateUpdateComponent.teacherDto
          )
          .subscribe(
            () => {
              this.smseduCrudComponent.onclear();
              this.teacherDialogForCreateUpdateComponent.onHideDialog();
              this.messageNotificationService.showSuccess(
                `Cập nhật giáo viên ${this.teacherDialogForCreateUpdateComponent.formGroup.value.fullName} thành công!`
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
        this.teacherDialogForCreateUpdateComponent.onSetDTO();
        this.teacherService
          .create(this.teacherDialogForCreateUpdateComponent.teacherDto)
          .subscribe(
            () => {
              this.smseduCrudComponent.onclear();
              this.teacherDialogForCreateUpdateComponent.onHideDialog();
              this.messageNotificationService.showSuccess(
                `Thêm  giáo viên ${this.teacherDialogForCreateUpdateComponent.formGroup.value.fullName} thành công!`
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

  onDelete(event: Event, teacher: ITeacher): void {
    this.confirmationDialogService.confirm(event, () => {
      this.teacherService.delete(teacher.id).subscribe(
        () => {
          this.smseduCrudComponent.onclear();
          this.messageNotificationService.showSuccess(
            `Xóa môn học  ${teacher.fullName} thành công!`
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

  onDeleteColection(event: Event, teachers: ITeacher[]): void {
    if (teachers.length > 0) {
      this.confirmationDialogService.confirm(event, () => {
        this.teacherService.deleteByIds(teachers.map((x) => x.id)).subscribe(
          () => {
            this.messageNotificationService.showSuccess(
              `Xóa ${teachers.length} môn học: ${teachers.map((x) => x.firstName).join(', ')} thành công!`
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
