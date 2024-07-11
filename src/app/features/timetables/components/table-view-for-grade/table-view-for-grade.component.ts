/* eslint-disable @typescript-eslint/no-explicit-any */
import { data } from '@features/timetables/helpers/data';
import { ITimetableUnit } from '@features/timetables/interfaces';

import { Input, OnInit, Component } from '@angular/core';

import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { DropdownModule } from 'primeng/dropdown';
import { SplitButtonModule } from 'primeng/splitbutton';

import { CoreModule } from '@core/core.module';
import { TableExportService } from '@core/services/table-export.service';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'smsedu-table-view-for-grade',
  standalone: true,
  imports: [
    CoreModule,
    ToolbarModule,
    ButtonModule,
    DropdownModule,
    SplitButtonModule,
  ],
  templateUrl: './table-view-for-grade.component.html',
  providers: [TableExportService],
})
export class TableViewForGradeComponent implements OnInit {
  grades: number[] = [10, 11, 12];

  selectedGrade: number = 10;

  @Input() data: ITimetableUnit[] = data;

  startAts: number[] = Array.from({ length: 60 }, (v, k) => k + 1);

  classNames: string[] = [];

  timetableUnits: ITimetableUnit[][] = [];

  exportItem: MenuItem[] = [];

  constructor(private tableExportService: TableExportService) {}

  ngOnInit(): void {
    this.onHandelTimetableUnits(this.selectedGrade);

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

  onHandelTimetableUnits(grade: number): void {
    this.data = data
      .filter((x) => x.className.slice(0, 2) === grade.toString())
      .sort((a, b) => {
        if (a.className > b.className) {
          return 1;
        } else if (a.className < b.className) {
          return -1;
        }
        return a.startAt > b.startAt ? 1 : a.startAt < b.startAt ? -1 : 0;
      });

    // * Lấy danh sách lớp học
    this.classNames = [...new Set(this.data.map((x) => x.className))];

    // * Khới tạo mảng 2 chiều cho thời khóa biểu
    this.data.forEach((x) => {
      // Ensure the inner array/object exists before assignment
      if (!this.timetableUnits[x.className]) {
        this.timetableUnits[x.className] = [];
      }
      this.timetableUnits[x.className][x.startAt] = x;
    });

    // * Khởi tạo dữ liệu trống
    for (const className of this.classNames) {
      for (let i = 1; i <= 60; i++) {
        if (!this.timetableUnits[className][i]) {
          this.timetableUnits[className][i] = null;
        }
      }
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onGradeChange(event: any): void {
    this.onHandelTimetableUnits(this.selectedGrade);
  }

  getNameAssignment(timetableUnit: ITimetableUnit): string {
    if (!timetableUnit) {
      return '';
    }
    return timetableUnit.subjectName + ' - ' + timetableUnit.teacherName;
  }

  // #region -- Handel Export Data --
  // @ Acition: Export Excel
  onExportExcel(): void {
    const result = [];
    for (let startAt = 1; startAt <= 60; startAt++) {
      const obj: object = {};
      for (const className of this.classNames) {
        obj[className] = this.getNameAssignment(
          this.timetableUnits[className][startAt]
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
      const obj: object = {};
      for (const className of this.classNames) {
        obj[className] = this.getNameAssignment(
          this.timetableUnits[className][startAt]
        );
      }
      result.push({
        Thứ: 'Thứ ' + this.convertNumFloor(startAt / 10 + 2),
        Tiết: this.onHandelStartAt(startAt),
        ...obj,
      });
    }
    const headers = ['Thứ', 'Tiết', ...this.classNames];
    const rows = result.map((row) => headers.map((col) => row[col]));
    this.tableExportService.exportPdf(
      headers,
      rows,
      'subjects',
      'Danh sách môn học',
      true
    );
  }
  // #endregion

  convertNumFloor(num: number): number {
    return Math.floor(num);
  }
}
