/* eslint-disable @typescript-eslint/no-explicit-any */

import { ISubjectDto } from '@features/subjects/interfaces';
import { SubjectService } from '@features/subjects/services/subject.service';

import {
  Input,
  Output,
  Component,
  EventEmitter,
  AfterViewInit,
  ChangeDetectorRef,
} from '@angular/core';

import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';

import { AppComponent } from 'src/app/app.component';

import { CoreModule } from '@core/core.module';
import { ConfirmationDialogService } from '@core/services/confirmation-dialog.service';
import { MessageNotificationService } from '@core/services/message-notification.service';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'smsedu-subject-diaglog-for-create-collection',
  standalone: true,
  imports: [CoreModule, DialogModule, TableModule, ButtonModule],
  templateUrl: './subject-diaglog-for-create-collection.component.html',
  providers: [ConfirmationDialogService, MessageNotificationService],
})
export class SubjectDiaglogForCreateCollectionComponent
  implements AfterViewInit
{
  @Input() excelData: any[] = [];

  dialog: boolean = false;

  @Output() clear = new EventEmitter();

  constructor(
    private confirmationDialogService: ConfirmationDialogService,
    private messageNotificationService: MessageNotificationService,
    private cdr: ChangeDetectorRef,
    public app: AppComponent,
    private subjectService: SubjectService
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

  onCheckData(): string {
    return '';
  }

  findDuplicateSubjetName(data) {
    const nameCounts = data.reduce((acc, item) => {
      acc[item.name] = (acc[item.name] || 0) + 1;
      return acc;
    }, {});

    const duplicates = Object.keys(nameCounts).filter(
      (name) => nameCounts[name] > 1
    );

    return duplicates;
  }

  // @ Acition: Save Classes
  onSaveClasses(event: Event): void {
    let subjectDtos: ISubjectDto[] = [];
    if (this.excelData.length > 0) {
      subjectDtos = this.excelData.map((item) => {
        return {
          name: item.name.toString(),
          shortName: item.shortName.toString(),
        };
      }) as ISubjectDto[];

      this.app.onShowSplashScreenService();
      this.confirmationDialogService.confirm(event, () => {
        this.subjectService.createCollection(subjectDtos).subscribe(
          () => {
            this.messageNotificationService.showSuccess(
              'Thêm danh sách môn học thành công!'
            );
            this.dialog = false;
            this.excelData = [];
            this.onClear();
            this.app.onHideSplashScreenService();
          },
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          (error) => {
            this.messageNotificationService.showError(
              'Thêm danh sách môn học không thành công'
            );
            this.app.onHideSplashScreenService();
          }
        );
      });
    }
  }
}
