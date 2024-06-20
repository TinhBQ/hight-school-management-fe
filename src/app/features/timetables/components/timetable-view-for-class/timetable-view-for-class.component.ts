import { data } from '@features/timetables/helpers/data';
import { ITimetableUnit } from '@features/timetables/interfaces';
import { ISchoolShift } from '@features/school-shift/interfaces/i-school-shift';
import { schoolShiftData } from '@features/school-shift/helpers/school-shift-data';

import { Input, OnInit, Component } from '@angular/core';

import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { DropdownModule } from 'primeng/dropdown';

import { CoreModule } from '@core/core.module';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'smsedu-timetable-view-for-class',
  standalone: true,
  imports: [CoreModule, ToolbarModule, ButtonModule, DropdownModule],
  templateUrl: './timetable-view-for-class.component.html',
})
export class TimetableViewForClassComponent implements OnInit {
  schoolShifts: ISchoolShift[] = schoolShiftData;

  selectedSchoolShift: ISchoolShift = this.schoolShifts[0];

  @Input() data: ITimetableUnit[] = data;

  startAts: number[] = Array.from({ length: 60 }, (v, k) => k + 1);

  classNames: string[] = [];

  timetableUnits: ITimetableUnit[][] = [];

  ngOnInit(): void {
    // * Sắp xếp mảng theo thứ tự lớp và startAt
    this.data = this.data.sort((a, b) => {
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

  onHandelStartAt(startAt: number): number {
    return startAt % 10 === 0 ? 10 : startAt % 10;
  }
}
