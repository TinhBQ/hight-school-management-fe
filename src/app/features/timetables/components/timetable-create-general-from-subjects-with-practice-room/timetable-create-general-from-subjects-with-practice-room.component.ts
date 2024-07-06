/* eslint-disable @typescript-eslint/no-explicit-any */
import { SubjectService } from '@features/subjects/services/subject.service';
import { ISubjectForCreateTimeTableWithPracticeRoom } from '@features/subjects/interfaces';

import { Input, OnInit, Component, ViewChild } from '@angular/core';

import { CoreModule } from '@core/core.module';
import { IColumn, IPagination } from '@core/interfaces';
import { ConfirmationDialogService } from '@core/services/confirmation-dialog.service';
import { MessageNotificationService } from '@core/services/message-notification.service';

import { SmseduCrudComponent } from '@shared/smsedu-crud/smsedu-crud.component';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'smsedu-timetable-create-general-from-subjects-with-practice-room',
  standalone: true,
  imports: [CoreModule, SmseduCrudComponent],
  templateUrl:
    './timetable-create-general-from-subjects-with-practice-room.component.html',
  providers: [
    SubjectService,
    MessageNotificationService,
    ConfirmationDialogService,
  ],
})
export class TimetableCreateGeneralFromSubjectsWithPracticeRoomComponent
  implements OnInit
{
  @Input()
  subjectForCreateTimeTableWithPracticeRoom: ISubjectForCreateTimeTableWithPracticeRoom[];

  columns: IColumn[] = [];

  @Input() pagination: IPagination;

  @ViewChild(SmseduCrudComponent)
  smseduCrudComponent: SmseduCrudComponent;

  constructor(
    private subjectService: SubjectService,
    private messageNotificationService: MessageNotificationService,
    private confirmationDialogService: ConfirmationDialogService
  ) {}

  ngOnInit(): void {
    this.columns = [
      { field: 'name', header: 'Môn học', isSort: false },
      { field: 'shortName', header: 'Ký hiệu', isSort: false },
      {
        field: 'roomCount',
        header: 'Số lượng phòng',
        isSort: false,
        typeEidt: 'inputNumber',
      },
    ];
  }
}
