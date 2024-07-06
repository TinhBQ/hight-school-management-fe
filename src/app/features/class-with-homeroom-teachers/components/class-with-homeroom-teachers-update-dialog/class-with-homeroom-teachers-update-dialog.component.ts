/* eslint-disable @typescript-eslint/no-explicit-any */
import { TeacherService } from '@features/teachers/services/teacher.service';
import { IClassWithHomeroomTeachers } from '@features/class-with-homeroom-teachers/interfaces';
import {
  ITeacher,
  ITeachersForClassRequestParameters,
} from '@features/teachers/interfaces';
import { ClassWithHomeroomTeachersService } from '@features/class-with-homeroom-teachers/services';

import { Output, Component, EventEmitter } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';

import { IPagination } from '@core/interfaces';
import { CoreModule } from '@core/core.module';
import { ConfirmationDialogService } from '@core/services/confirmation-dialog.service';
import { MessageNotificationService } from '@core/services/message-notification.service';

import { SmseduAutoCompleteComponent } from '@shared/smsedu-auto-complete/smsedu-auto-complete.component';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'smsedu-class-with-homeroom-teachers-update-dialog',
  standalone: true,
  imports: [
    CoreModule,
    DialogModule,
    ButtonModule,
    SmseduAutoCompleteComponent,
  ],
  templateUrl: './class-with-homeroom-teachers-update-dialog.component.html',
  providers: [
    TeacherService,
    ConfirmationDialogService,
    ClassWithHomeroomTeachersService,
    MessageNotificationService,
  ],
})
export class ClassWithHomeroomTeachersUpdateDialogComponent {
  dialog: boolean = false;

  dataDto: IClassWithHomeroomTeachers;

  loadingAutoComplete: boolean = false;

  @Output() save = new EventEmitter();

  // * Form Generator: Class
  _form: FormGroup = this.fb.group({
    classId: [null, Validators.compose([Validators.required])],
    homeroomTeacher: [null, Validators.compose([Validators.required])],
  });

  teachersForClassRequestParameters: ITeachersForClassRequestParameters = {
    isAssignedHomeroom: false,
  };

  teachesUnAssignedHomeroom: ITeacher[] = [];

  paginationForTeachesUnAssignedHomeroom: IPagination;

  constructor(
    private fb: FormBuilder,
    private teacherService: TeacherService,
    private confirmationDialogService: ConfirmationDialogService,
    private classWithHomeroomTeachersService: ClassWithHomeroomTeachersService,
    private messageNotificationService: MessageNotificationService
  ) {}

  onHideDialog() {
    this.dialog = false;
  }

  onSave() {
    this.confirmationDialogService.confirm(event, () => {
      this.classWithHomeroomTeachersService
        .update(this._form.value.classId, {
          homeroomTeacherId: this._form.value.homeroomTeacher.id,
        })
        .subscribe(
          () => {
            this.save.emit();
            this.onHideDialog();
            this.messageNotificationService.showSuccess(
              'Thêm danh sách lớp tành công!'
            );
          },
          (error) => {
            this.onHideDialog();
            this.messageNotificationService.showError(
              error.message ?? 'Đã xảy ra lỗi.'
            );
          }
        );
    });
  }

  // * --------------------- Handel AutoComplete --------------------

  onSearch(event: any): void {
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

  loadDataOnLazyLoad(event: any) {
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

  onDropdownClick() {
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

  onSelectTeacher(event) {
    this._form.setValue({
      classId: this._form.value.classId,
      homeroomTeacher: event.value,
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
