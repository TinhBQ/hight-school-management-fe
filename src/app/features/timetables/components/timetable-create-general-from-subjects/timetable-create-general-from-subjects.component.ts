/* eslint-disable @typescript-eslint/no-explicit-any */
import { IStartAtSession } from '@features/timetables/interfaces';
import { SubjectService } from '@features/subjects/services/subject.service';
import { ISubjectForCreateTimeTableWithGeneral } from '@features/subjects/interfaces/i-subject';
import { ConvertStartAtSessionPipe } from '@features/timetables/pipes/convert-start-at-session.pipe';

import { Input, OnInit, Component, ViewChild } from '@angular/core';

import { MultiSelectModule } from 'primeng/multiselect';

import { CoreModule } from '@core/core.module';
import { IColumn, IPagination } from '@core/interfaces';
import { ConfirmationDialogService } from '@core/services/confirmation-dialog.service';
import { MessageNotificationService } from '@core/services/message-notification.service';

import { SmseduCrudComponent } from '@shared/smsedu-crud/smsedu-crud.component';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'smsedu-timetable-create-general-from-subjects',
  standalone: true,
  imports: [
    CoreModule,
    SmseduCrudComponent,
    MultiSelectModule,
    ConvertStartAtSessionPipe,
  ],
  templateUrl: './timetable-create-general-from-subjects.component.html',
  providers: [
    SubjectService,
    MessageNotificationService,
    ConfirmationDialogService,
  ],
})
export class TimetableCreateGeneralFromSubjectsComponent implements OnInit {
  @Input()
  subjectForCreateTimeTableWithGeneral: ISubjectForCreateTimeTableWithGeneral[];

  columns: IColumn[] = [];

  @Input() pagination: IPagination;

  @ViewChild(SmseduCrudComponent)
  smseduCrudComponent: SmseduCrudComponent;

  startAts: number[] = Array.from({ length: 60 }, (v, k) => k + 1);

  startAtsAfternoon: IStartAtSession[] = [];

  startAtsMorning: IStartAtSession[] = [];

  ngOnInit(): void {
    this.columns = [
      { field: 'subject.name', header: 'Môn học', isSort: true },
      { field: 'subject.shortName', header: 'Ký hiệu', isSort: true },
      {
        field: 'startAtsMorning',
        header: 'Buổi sáng',
        pipe: new ConvertStartAtSessionPipe(),
        isSort: false,
        typeEidt: 'multiSelect',
        options: {
          data: this.startAtsMorning,
        },
      },
      {
        field: 'startAtsAfternoon',
        header: 'Buổi chiều',
        isSort: false,
        pipe: new ConvertStartAtSessionPipe(),
        typeEidt: 'multiSelect',
        options: {
          data: this.startAtsAfternoon,
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          onchange: (value) => {},
        },
      },
    ];

    this.startAts.forEach((startAt) => {
      const a = Math.ceil(startAt / 10) + 1;
      const b = startAt % 10 === 0 ? 10 : startAt % 10;
      if (b <= 5) {
        this.startAtsMorning.push({
          startAt,
          name: 'Thứ ' + a + ' - Tiết' + b,
        });
      } else {
        this.startAtsAfternoon.push({
          startAt,
          name: 'Thứ ' + a + ' - Tiết ' + b,
        });
      }
    });
  }
}
