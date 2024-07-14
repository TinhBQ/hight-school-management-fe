/* eslint-disable @typescript-eslint/no-explicit-any */
import { IClass } from '@features/classes/interfaces';
import { ISchoolShift } from '@features/school-shift/interfaces/i-school-shift';
import { schoolShiftData } from '@features/school-shift/helpers/school-shift-data';
import {
  ITimetableUnit,
  IConstraintError,
} from '@features/timetables/interfaces';

import { Input, OnInit, Component } from '@angular/core';

import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { DropdownModule } from 'primeng/dropdown';
import { SplitButtonModule } from 'primeng/splitbutton';
import { OverlayPanelModule } from 'primeng/overlaypanel';

import { CoreModule } from '@core/core.module';
import { TableExportService } from '@core/services/table-export.service';

import { TimetableViewFullComponent } from '../timetable-view-full/timetable-view-full.component';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'smsedu-timetable-view-for-school-shift',
  standalone: true,
  imports: [
    CoreModule,
    ToolbarModule,
    ButtonModule,
    DropdownModule,
    TimetableViewFullComponent,
    SplitButtonModule,
    OverlayPanelModule,
  ],
  templateUrl: './timetable-view-for-school-shift.component.html',
  providers: [TableExportService],
})
export class TimetableViewForSchoolShiftComponent implements OnInit {
  @Input() data: ITimetableUnit[];

  schoolShifts: ISchoolShift[] = schoolShiftData;

  selectedSchoolShift: ISchoolShift = this.schoolShifts[0];

  startAts: number[] = Array.from({ length: 60 }, (v, k) => k + 1);

  classes: IClass[] = [];

  selectClasses: IClass[] = [];

  timetableUnits: ITimetableUnit[][] = [];

  exportItem: MenuItem[] = [];

  constructor(private tableExportService: TableExportService) {}

  ngOnInit(): void {
    this.data = this.data.sort((a, b) => {
      if (a.className > b.className) {
        return 1;
      } else if (a.className < b.className) {
        return -1;
      }
      return a.startAt > b.startAt ? 1 : a.startAt < b.startAt ? -1 : 0;
    });

    // * Lấy danh sách lớp học
    this.classes = this.getUniqueClasse(this.data);

    // * Khới tạo mảng 2 chiều cho thời khóa biểu
    this.data.forEach((x) => {
      // Ensure the inner array/object exists before assignment
      if (!this.timetableUnits[x.className]) {
        this.timetableUnits[x.className] = [];
      }
      this.timetableUnits[x.className][x.startAt] = x;
    });

    // * Khởi tạo dữ liệu trống
    for (const klass of this.classes) {
      for (let i = 1; i <= 60; i++) {
        if (!this.timetableUnits[klass.name][i]) {
          this.timetableUnits[klass.name][i] = null;
        }
      }
    }

    this.selectClasses = this.getUniqueClasse(
      this.data.filter((x) => this.onHandelStartAt(x.startAt) <= 5)
    );

    this.exportItem = [
      {
        label: 'XLS',
        icon: 'pi pi-fw pi-file-excel',
        command: () => {
          this.onExportExcel();
        },
      },
      {
        label: 'PDF',
        icon: 'pi pi-fw pi-file-pdf',
        command: () => {
          this.onExportPDF();
        },
      },
    ];
  }

  onHandelStartAt(startAt: number): number {
    return startAt % 10 === 0 ? 10 : startAt % 10;
  }

  getNameAssignment(timetableUnit: ITimetableUnit): string {
    if (!timetableUnit) {
      return '';
    }
    return timetableUnit.subjectName + ' - ' + timetableUnit.teacherName;
  }

  getUniqueClasse(timetableUnits: ITimetableUnit[]): IClass[] {
    const classMap: Map<string, string> = new Map();

    timetableUnits.forEach((item) => {
      if (!classMap.has(item.classId)) {
        classMap.set(item.classId, item.className);
      }
    });

    return Array.from(classMap, ([classId, className]) => ({
      id: classId,
      name: className,
    })) as IClass[];
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSchoolShiftChange(event: any): void {
    if (event.value.id === 0) {
      this.selectClasses = this.getUniqueClasse(
        this.data.filter((x) => this.onHandelStartAt(x.startAt) <= 5)
      );
    } else {
      this.selectClasses = this.getUniqueClasse(
        this.data.filter((x) => this.onHandelStartAt(x.startAt) > 5)
      );
    }
  }

  convertNumFloor(num: number): number {
    return Math.floor(num);
  }

  // #region -- Handel Export Data --
  // @ Acition: Export Excel
  onExportExcel(): void {
    const result = [];
    for (let startAt = 1; startAt <= 60; startAt++) {
      if (
        this.selectedSchoolShift.id === 0 &&
        this.onHandelStartAt(startAt) > 5
      ) {
        continue;
      }

      if (
        this.selectedSchoolShift.id === 1 &&
        this.onHandelStartAt(startAt) <= 5
      ) {
        continue;
      }

      const obj: object = {};
      for (const klass of this.selectClasses) {
        obj[klass.name] = this.getNameAssignment(
          this.timetableUnits[klass.name][startAt]
        );
      }

      result.push({
        Thứ: 'Thứ ' + this.convertNumFloor(startAt / 10 + 2),
        Tiết: this.onHandelStartAt(startAt),
        ...obj,
      });
    }

    this.tableExportService.exportExcel(
      result,
      'timetable-view-for-school-shift'
    );
  }

  // @ Acition: Export PDf
  onExportPDF(): void {
    const result = [];
    for (let startAt = 1; startAt <= 60; startAt++) {
      if (
        this.selectedSchoolShift.id === 0 &&
        this.onHandelStartAt(startAt) > 5
      ) {
        continue;
      }

      if (
        this.selectedSchoolShift.id === 1 &&
        this.onHandelStartAt(startAt) <= 5
      ) {
        continue;
      }

      const obj: object = {};
      for (const klass of this.selectClasses) {
        obj[klass.name] = this.getNameAssignment(
          this.timetableUnits[klass.name][startAt]
        );
      }

      result.push({
        Thứ: 'Thứ ' + this.convertNumFloor(startAt / 10 + 2),
        Tiết: this.onHandelStartAt(startAt),
        ...obj,
      });
    }

    const headers = ['Thứ', 'Tiết', ...this.selectClasses.map((x) => x.name)];
    const rows = result.map((row) => headers.map((col) => row[col]));
    this.tableExportService.exportPdf(
      headers,
      rows,
      'subjects',
      'Thời khóa biểu buổi ' + this.selectedSchoolShift.name,
      true
    );
  }
  // #endregion

  getStringConstraintError(item: IConstraintError): string {
    const code = item?.code;
    const hardConstraint = item?.isHardConstraint
      ? 'Ràng buộc cứng'
      : 'Ràng buộc mềm';
    const description = item?.description;

    return `[${code}] ${hardConstraint}: ${description}`;
  }

  isHardConstraint(item: IConstraintError[]): boolean {
    return item.some((x) => x.isHardConstraint === true);
  }
}
