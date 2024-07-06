import { data } from '@features/timetables/helpers/data';
import { IClass } from '@features/classes/interfaces/i-class';
import { ITimetableUnitForEditDto } from '@features/timetables/interfaces';

import { Input, Component } from '@angular/core';

import { CoreModule } from '@core/core.module';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'smsedu-timetable-for-class',
  standalone: true,
  imports: [CoreModule],
  templateUrl: './timetable-for-class.component.html',
  styleUrl: './timetable-for-class.component.scss',
})
export class TimetableForClassComponent {
  @Input() klass: IClass = {
    id: data[0].classId,
    name: data[0].className,
  };

  @Input() data: ITimetableUnitForEditDto[];

  numWeekdays: number[] = Array.from({ length: 6 }, (v, k) => k + 2);

  startAtsInDay: number[] = Array.from({ length: 10 }, (v, k) => k + 1);

  @Input() timeTableUnits2Dimensional: ITimetableUnitForEditDto[][] = [];

  onHandelStartAt(startAt: number): number {
    return startAt % 10 === 0 ? 10 : startAt % 10;
  }
}
