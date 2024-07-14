import { IClass } from '@features/classes/interfaces';
import {
  ITimetableUnit,
  IConstraintError,
} from '@features/timetables/interfaces';

import { OnInit, Component } from '@angular/core';

import { OverlayPanelModule } from 'primeng/overlaypanel';
import {
  DialogService,
  DynamicDialogRef,
  DynamicDialogConfig,
  DynamicDialogModule,
} from 'primeng/dynamicdialog';

import { CoreModule } from '@core/core.module';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'smsedu-timetable-edit-check-and-save',
  standalone: true,
  imports: [CoreModule, OverlayPanelModule, DynamicDialogModule],
  templateUrl: './timetable-edit-check-and-save.component.html',
  providers: [DialogService],
})
export class TimetableEditCheckAndSaveComponent implements OnInit {
  data: ITimetableUnit[];

  startAts: number[] = Array.from({ length: 60 }, (v, k) => k + 1);

  classes: IClass[] = [];

  timetableUnits: ITimetableUnit[][] = [];

  ref: DynamicDialogRef | undefined;

  constructor(private config: DynamicDialogConfig) {}

  ngOnInit(): void {
    if (this.config?.data && this.config.data?.timetableUnits) {
      this.data = this.config.data?.timetableUnits;
    }

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

  convertNumFloor(num: number): number {
    return Math.floor(num);
  }

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
