/* eslint-disable @typescript-eslint/no-explicit-any */
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { TeacherListComponent } from '@features/teachers/components/teacher-list/teacher-list.component';
import { SubjectsTeachersService } from '@features/subjects-teachers/services/subjects-teachers.service';
import {
  ISubjectsTeachers,
  ISubjectsForTeacherRequestParameters,
} from '@features/subjects-teachers/interfaces';

import {
  Input,
  OnInit,
  Output,
  Component,
  ViewChild,
  EventEmitter,
  ChangeDetectorRef,
} from '@angular/core';

import { SplitterModule } from 'primeng/splitter';
import {
  DialogService,
  DynamicDialogRef,
  DynamicDialogConfig,
  DynamicDialogModule,
} from 'primeng/dynamicdialog';

import { CoreModule } from '@core/core.module';
import { ConfirmationDialogService } from '@core/services/confirmation-dialog.service';
import { MessageNotificationService } from '@core/services/message-notification.service';
import {
  IColumn,
  IPagination,
  ICustomAction,
  IResponseBase,
} from '@core/interfaces';

import { SmseduCrudComponent } from '@shared/smsedu-crud/smsedu-crud.component';

import { SubjectsForTeacherUnassignedComponent } from '../subjects-for-teacher-unassigned/subjects-for-teacher-unassigned.component';
import { SubjectsForTeacherUpdateIsMainComponent } from '../subjects-for-teacher-update-is-main/subjects-for-teacher-update-is-main.component';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'smsedu-subjects-for-teacher',
  standalone: true,
  imports: [
    CoreModule,
    SplitterModule,
    SmseduCrudComponent,
    SubjectsForTeacherUnassignedComponent,
    SubjectsForTeacherUpdateIsMainComponent,
    DynamicDialogModule,
    TeacherListComponent,
  ],
  templateUrl: './subjects-for-teacher.component.html',
  providers: [
    SubjectsTeachersService,
    DialogService,
    ConfirmationDialogService,
    MessageNotificationService,
  ],
})
export class SubjectsForTeacherComponent implements OnInit {
  @Input() teacherId: string = '';

  columns: IColumn[] = [];

  result: IResponseBase<ISubjectsTeachers[]>;

  pagination: IPagination;

  loading: boolean = false;

  searchString = '';

  searchText$ = new Subject<string>();

  customActions: ICustomAction[] = [];

  requestParameters: ISubjectsForTeacherRequestParameters;

  ref: DynamicDialogRef | undefined;

  @Output() handleAction = new EventEmitter();

  @ViewChild(SmseduCrudComponent)
  smseduCrudComponent: SmseduCrudComponent;

  @ViewChild(SubjectsForTeacherUnassignedComponent)
  subjectsForTeacherUnassignedComponent: SubjectsForTeacherUnassignedComponent;

  @ViewChild(SubjectsForTeacherUpdateIsMainComponent)
  subjectsForTeacherUpdateIsMainComponent: SubjectsForTeacherUpdateIsMainComponent;

  action: any;

  constructor(
    private subjectsTeachersService: SubjectsTeachersService,
    private config: DynamicDialogConfig,
    private cdr: ChangeDetectorRef,
    private confirmationDialogService: ConfirmationDialogService,
    private messageNotificationService: MessageNotificationService,

    public teacherListComponent: TeacherListComponent
  ) {}

  ngOnInit(): void {
    if (this.config.data && this.config.data.teacherId) {
      this.teacherId = this.config.data.teacherId;
      this.requestParameters = {
        teacherId: this.config.data.teacherId,
      };
      this.action = this.config.data.handleAction;
    }

    this.searchText$
      .pipe(debounceTime(1000), distinctUntilChanged())
      .subscribe((packageName) => {
        this.requestParameters.searchTerm = packageName;
        return this.getSubjectsForTeacher(this.requestParameters);
      });

    this.columns = [
      { field: 'subject.name', header: 'Môn học', isSort: false },
      { field: 'isMain', header: 'Môn chính', isSort: false },
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
          this.onDelete(evnet, data);
        },
      },
    ];
  }

  onLoadSubjectsForTeacher(event: any): void {
    const { first, rows, sortField, sortOrder } = event;

    this.requestParameters = {
      teacherId: this.teacherId,
      pageNumber: first / rows + 1 || null,
      pageSize: rows || null,
      orderBy: sortField
        ? sortOrder == 1
          ? sortField
          : `${sortField} desc`
        : null,
    };

    this.getSubjectsForTeacher(this.requestParameters);
  }

  private getSubjectsForTeacher(
    params: ISubjectsForTeacherRequestParameters
  ): void {
    this.loading = true;

    this.subjectsTeachersService.find(params).subscribe(
      (response) => {
        this.result = response.result;
        this.pagination = response.pagination;
        this.loading = false;
        this.cdr.detectChanges(); // Mark for change detection
      },
      (error) => {
        console.log(error.toString());
        this.loading = false;
      }
    );
  }

  onShowDialogForEdit(subjecTeacher: ISubjectsTeachers): void {
    console.log(subjecTeacher);
    this.subjectsForTeacherUpdateIsMainComponent._form.setValue({
      id: subjecTeacher.id,
      teacher: subjecTeacher.teacher,
      subject: subjecTeacher.subject,
      isMain: subjecTeacher.isMain,
    });

    this.subjectsForTeacherUpdateIsMainComponent.prevIsMain =
      subjecTeacher.isMain;

    this.subjectsForTeacherUpdateIsMainComponent.dialogVisible = true;
    this.cdr.detectChanges(); // Mark for change detection
  }

  onSave(): void {
    if (this.subjectsForTeacherUpdateIsMainComponent._form.valid) {
      if (this.subjectsForTeacherUpdateIsMainComponent._form.value.id) {
        this.subjectsForTeacherUpdateIsMainComponent.onSetDto();
        this.subjectsTeachersService
          .update(
            this.subjectsForTeacherUpdateIsMainComponent._form.value.id,
            this.subjectsForTeacherUpdateIsMainComponent.subjectTeacherDto
          )
          .subscribe(
            () => {
              this.onClear();
              this.subjectsForTeacherUpdateIsMainComponent.onHideDialog();
              this.messageNotificationService.showSuccess(
                `Cập nhật thành công!`
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

  onAction(): void {
    this.handleAction.emit();
  }

  onDelete(event: Event, subjecTeacher: ISubjectsTeachers): void {
    this.confirmationDialogService.confirm(event, () => {
      this.subjectsTeachersService.delete(subjecTeacher.id).subscribe(
        () => {
          this.onClear();
          this.subjectsForTeacherUnassignedComponent.onCLear();
          this.messageNotificationService.showSuccess(
            `Xóa môn học  ${subjecTeacher.subject.name} thành công!`
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

  onClear(): void {
    this.smseduCrudComponent.onclear();
    this.handleAction.emit();
    this.teacherListComponent.onClear();
  }

  onDeleteCollection(event: Event, subjecTeachers: ISubjectsTeachers[]): void {
    if (subjecTeachers.length > 0) {
      this.confirmationDialogService.confirm(event, () => {
        this.subjectsTeachersService
          .deleteByIds(subjecTeachers.map((x) => x.id))
          .subscribe(
            () => {
              this.messageNotificationService.showSuccess(
                `Xóa ${subjecTeachers.length} môn học: ${subjecTeachers.map((x) => x.subject.name).join(', ')} thành công!`
              );
              this.onClear();
              this.subjectsForTeacherUnassignedComponent.onCLear();
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
