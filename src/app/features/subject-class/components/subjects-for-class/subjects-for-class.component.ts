/* eslint-disable @typescript-eslint/no-explicit-any */
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import {
  SubjectClassService,
  SubjectsForClassService,
} from '@features/subject-class/services';
import {
  ISubjectClass,
  ISubjectsForClassRequestParameters,
} from '@features/subject-class/interfaces';

import {
  Input,
  OnInit,
  Component,
  ViewChild,
  ChangeDetectorRef,
} from '@angular/core';

import { TableModule } from 'primeng/table';
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

import { SubjectsForClassUnassignedComponent } from '../subjects-for-class-unassigned/subjects-for-class-unassigned.component';
import { SubjectsForClassUpdatePeriodCountComponent } from '../subjects-for-class-update-period-count/subjects-for-class-update-period-count.component';

@Component({
  selector: 'app-subjects-for-class',
  standalone: true,
  imports: [
    CoreModule,
    SplitterModule,
    TableModule,
    SmseduCrudComponent,
    SubjectsForClassUnassignedComponent,
    SubjectsForClassUpdatePeriodCountComponent,
    DynamicDialogModule,
  ],
  templateUrl: './subjects-for-class.component.html',
  providers: [
    SubjectsForClassService,
    MessageNotificationService,
    ConfirmationDialogService,
    SubjectClassService,
    DialogService,
  ],
})
export class SubjectsForClassComponent implements OnInit {
  @Input() classId: string = '';

  columns: IColumn[] = [];

  result: IResponseBase<ISubjectClass[]>;

  pagination: IPagination;

  requestParameters: ISubjectsForClassRequestParameters = {
    classId: this.classId,
  };

  loading = false;

  searchClass = '';

  searchText$ = new Subject<string>();

  ref: DynamicDialogRef | undefined;

  customActions: ICustomAction[] = [];

  @ViewChild(SmseduCrudComponent)
  smseduCrudComponent: SmseduCrudComponent;

  @ViewChild(SubjectsForClassUnassignedComponent)
  subjectsForClassUnassignedComponent: SubjectsForClassUnassignedComponent;

  @ViewChild(SubjectsForClassUpdatePeriodCountComponent)
  subjectsForClassUpdatePeriodCountComponent: SubjectsForClassUpdatePeriodCountComponent;

  constructor(
    private subjectsForClassService: SubjectsForClassService,
    private config: DynamicDialogConfig,
    private sbjectClassService: SubjectClassService,
    private messageNotificationService: MessageNotificationService,
    private confirmationDialogService: ConfirmationDialogService,
    public dialogService: DialogService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    if (this.config.data && this.config.data.classId) {
      this.classId = this.config.data.classId; // Lấy classId từ config.data
      this.requestParameters.classId = this.config.data.classId;
      this.cdr.detectChanges(); // Mark for change detection
    }

    this.searchText$
      .pipe(debounceTime(1000), distinctUntilChanged())
      .subscribe((packageName) => {
        this.requestParameters.searchTerm = packageName;
        return this.getSubjectsForClass(this.requestParameters);
      });

    this.columns = [
      { field: 'subject.name', header: 'Môn học', isSort: false },
      { field: 'periodCount', header: 'Số tiết/Tuần', isSort: true },
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

  onLoadSubjectsForClass(event: any): void {
    this.loading = true;
    const { first, rows, sortField, sortOrder } = event;

    this.requestParameters = {
      classId: this.classId,
      pageNumber: first / rows + 1 || null,
      pageSize: rows || null,
      orderBy: sortField
        ? sortOrder == 1
          ? sortField
          : `${sortField} desc`
        : null,
    };

    this.getSubjectsForClass(this.requestParameters);
  }

  private getSubjectsForClass(
    params: ISubjectsForClassRequestParameters
  ): void {
    this.loading = true;
    this.subjectsForClassService.findByClassId(params).subscribe(
      (response) => {
        this.result = response.result;
        this.pagination = response.pagination;
        this.loading = false;
        this.cdr.detectChanges(); // Mark for change detection
      },
      (error) => {
        console.log(error.toString());
      }
    );
  }

  onSave(): void {
    if (
      this.subjectsForClassUpdatePeriodCountComponent.subjectsForClassForm.valid
    ) {
      if (
        this.subjectsForClassUpdatePeriodCountComponent.subjectsForClassForm
          .value.id
      ) {
        this.subjectsForClassUpdatePeriodCountComponent.onSetSubjectClassDto();
        this.sbjectClassService
          .update(
            this.subjectsForClassUpdatePeriodCountComponent.subjectsForClassForm
              .value.id,
            this.subjectsForClassUpdatePeriodCountComponent.subjectClassDto
          )
          .subscribe(
            () => {
              this.smseduCrudComponent.onclear();
              this.subjectsForClassUpdatePeriodCountComponent.onHideDialog();
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

  onShowDialogForEdit(subjecClass: ISubjectClass): void {
    console.log(subjecClass);
    this.subjectsForClassUpdatePeriodCountComponent.subjectsForClassForm.setValue(
      {
        id: subjecClass.id,
        periodCount: subjecClass.periodCount,
        subject: subjecClass.subject,
        class: subjecClass.class,
      }
    );

    this.subjectsForClassUpdatePeriodCountComponent.prevPeriodCount =
      subjecClass.periodCount;

    this.subjectsForClassUpdatePeriodCountComponent.dialogVisible = true;
    this.cdr.detectChanges(); // Mark for change detection
  }

  onDelete(event: Event, subjecClass: ISubjectClass): void {
    this.confirmationDialogService.confirm(event, () => {
      this.sbjectClassService.delete(subjecClass.id).subscribe(
        () => {
          this.smseduCrudComponent.onclear();
          this.subjectsForClassUnassignedComponent.onCLear();
          this.messageNotificationService.showSuccess(
            `Xóa môn học  ${subjecClass.subject.name} thành công!`
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

  onDeleteCollection(event: Event, subjecClasses: ISubjectClass[]): void {
    if (subjecClasses.length > 0) {
      this.confirmationDialogService.confirm(event, () => {
        this.sbjectClassService
          .deleteByIds(subjecClasses.map((x) => x.id))
          .subscribe(
            () => {
              this.messageNotificationService.showSuccess(
                `Xóa ${subjecClasses.length} môn học: ${subjecClasses.map((x) => x.subject.name).join(', ')} thành công!`
              );
              this.smseduCrudComponent.onclear();
              this.subjectsForClassUnassignedComponent.onCLear();
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

  onClose(): void {
    if (this.ref) {
      this.ref.close();
    }
  }
}
