/* eslint-disable @typescript-eslint/no-explicit-any */

import { ITeacherDto } from '@features/teachers/interfaces';
import { TeacherService } from '@features/teachers/services/teacher.service';

import {
  Input,
  Output,
  Component,
  EventEmitter,
  AfterViewInit,
  ChangeDetectorRef,
} from '@angular/core';

import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';

import { AppComponent } from 'src/app/app.component';

import { splitFullName } from '@core/utils';
import { CoreModule } from '@core/core.module';
import { ConfirmationDialogService } from '@core/services/confirmation-dialog.service';
import { MessageNotificationService } from '@core/services/message-notification.service';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'smsedu-teacher-diaglog-for-create-collection',
  standalone: true,
  imports: [CoreModule, DialogModule, TableModule, ButtonModule],
  templateUrl: './teacher-diaglog-for-create-collection.component.html',
  providers: [
    ConfirmationDialogService,
    MessageNotificationService,
    TeacherService,
  ],
})
export class TeacherDiaglogForCreateCollectionComponent
  implements AfterViewInit
{
  @Input() excelData: any[] = [];

  dialog: boolean = false;

  @Output() clear = new EventEmitter();

  constructor(
    private confirmationDialogService: ConfirmationDialogService,
    private teacherService: TeacherService,
    private messageNotificationService: MessageNotificationService,
    private cdr: ChangeDetectorRef,
    public app: AppComponent
  ) {}

  ngAfterViewInit(): void {
    this.cdr.detectChanges();
  }

  onClear(): void {
    this.clear.emit();
  }

  onRemoveRowData(event: Event, rowData: any): void {
    if (this.excelData.length > 0) {
      this.confirmationDialogService.confirm(
        event,
        () => {
          this.excelData = this.excelData.filter((x) => x !== rowData);
        },
        null,
        'Bạn có chắc chắn muốn xóa môn học ' + rowData.name + '?'
      );
    } else {
      this.dialog = false;
    }
  }

  // @ Acition: Save Classes
  onSaveClasses(event: Event): void {
    let teacherDtos: ITeacherDto[] = [];
    if (this.excelData.length > 0) {
      teacherDtos = this.excelData.map((x) => {
        const split = splitFullName(x.fullName);
        return {
          firstName: split[0],
          middleName: split[1],
          lastName: split[2],
          shortName: x.shortName,
        };
      }) as ITeacherDto[];

      this.app.onShowSplashScreenService();
      this.confirmationDialogService.confirm(event, () => {
        this.teacherService.createCollection(teacherDtos).subscribe(
          () => {
            this.messageNotificationService.showSuccess(
              'Thêm danh sách Giáo viên thành công!'
            );
            this.dialog = false;
            this.excelData = [];
            this.onClear();
            this.app.onHideSplashScreenService();
          },
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          (error) => {
            this.messageNotificationService.showError(
              'Thêm danh sách Giáo viên không thành công'
            );
            this.app.onHideSplashScreenService();
          }
        );
      });
    }
  }
}
