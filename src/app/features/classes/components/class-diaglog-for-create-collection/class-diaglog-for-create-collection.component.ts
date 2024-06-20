/* eslint-disable @typescript-eslint/no-explicit-any */
import { IClassDto } from '@features/classes/interfaces/i-class';
import { ClassService } from '@features/classes/services/class.service';
import { ISchoolShift } from '@features/school-shift/interfaces/i-school-shift';
import { schoolShiftData } from '@features/school-shift/helpers/school-shift-data';

import { Input, Output, Component, EventEmitter } from '@angular/core';

import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';

import { CoreModule } from '@core/core.module';
import { ConfirmationDialogService } from '@core/services/confirmation-dialog.service';
import { MessageNotificationService } from '@core/services/message-notification.service';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'smsedu-class-diaglog-for-create-collection',
  standalone: true,
  imports: [
    CoreModule,
    DialogModule,
    TableModule,
    ButtonModule,
    DropdownModule,
  ],
  templateUrl: './class-diaglog-for-create-collection.component.html',
  providers: [
    ConfirmationDialogService,
    ClassService,
    MessageNotificationService,
  ],
})
export class ClassDiaglogForCreateCollectionComponent {
  @Input() excelData: any[] = [];

  dialog: boolean = false;

  grades: number[] = [10, 11, 12];

  schoolShifts: ISchoolShift[] = schoolShiftData;

  @Output() clear = new EventEmitter();

  constructor(
    private confirmationDialogService: ConfirmationDialogService,
    private classService: ClassService,
    private messageNotificationService: MessageNotificationService
  ) {}

  onClear(): void {
    this.clear.emit();
  }

  onRemoveRowData(event: Event, rowData: any): void {
    if (this.excelData.length > 0) {
      this.confirmationDialogService.confirm(event, () => {
        this.excelData = this.excelData.filter((x) => x !== rowData);
      });
    } else {
      this.dialog = false;
    }
  }

  // @ Acition: Save Classes
  onSaveClasses(event: Event): void {
    let classDtos: IClassDto[] = [];
    if (this.excelData.length > 0) {
      classDtos = this.excelData.map((item) => {
        return {
          grade: parseInt(item.grade),
          name: item.name.toString(),
          schoolShift: parseInt(item.schoolShift.id),
          startYear: parseInt(item.year.slice(0, 4)),
          endYear: parseInt(item.year.slice(5, 9)),
        };
      }) as IClassDto[];
      this.confirmationDialogService.confirm(event, () => {
        this.classService.createCollection(classDtos).subscribe(
          () => {
            this.messageNotificationService.showSuccess(
              'Thêm danh sách lớp tành công!'
            );
            this.dialog = false;
            this.excelData = [];
            this.onClear();
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

  isCheckClassNameAndGrade(name?: string, grade?: string): boolean {
    return name == null ||
      grade == null ||
      name.slice(0, 2).toString() !== grade.toString()
      ? false
      : true;
  }

  isCheckClassNameAndGradeColection(): boolean {
    return this.excelData.every((x) =>
      this.isCheckClassNameAndGrade(x.name, x.grade)
    );
  }

  isCheckClassNotNull(): boolean {
    return this.excelData.every(
      (x) =>
        x.name != null &&
        x.grade != null &&
        x.schoolShift != null &&
        x.year != null &&
        x.name != '' &&
        x.grade != '' &&
        x.schoolShift != '' &&
        x.year != ''
    );
  }

  isCheckClassYear(year: string): boolean {
    return year == null ||
      !/^\d+$/.test(year.slice(0, 4)) ||
      !/^\d+$/.test(year.slice(5, 9)) ||
      parseInt(year.slice(0, 4)) + 1 != parseInt(year.slice(5, 9))
      ? false
      : true;
  }

  isCheckClassYearColection(): boolean {
    return this.excelData.every((x) => this.isCheckClassYear(x.year));
  }
}
