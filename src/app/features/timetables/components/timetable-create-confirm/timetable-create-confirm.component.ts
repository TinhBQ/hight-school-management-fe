import { IClass } from '@features/classes/interfaces';
import { TimetablesService } from '@features/timetables/services/timetables.service';
import {
  ITimetableUnitForEditDto,
  ITimetableRequestParameters,
} from '@features/timetables/interfaces';
import {
  ISubjectForCreateTimeTableWithDoublePeriod,
  ISubjectForCreateTimeTableWithPracticeRoom,
} from '@features/subjects/interfaces';

import { Input, OnInit, Component } from '@angular/core';

import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';

import { CoreModule } from '@core/core.module';
import { ConfirmationDialogService } from '@core/services/confirmation-dialog.service';

import { TimetableViewFullComponent } from '../timetable-view-full/timetable-view-full.component';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'smsedu-timetable-create-confirm',
  standalone: true,
  imports: [
    CoreModule,
    TimetableViewFullComponent,
    ToolbarModule,
    ButtonModule,
    TagModule,
  ],
  templateUrl: './timetable-create-confirm.component.html',
  providers: [TimetablesService, ConfirmationDialogService],
})
export class TimetableCreateConfirmComponent implements OnInit {
  @Input() timetableRequestParameters: ITimetableRequestParameters;

  @Input() classes: IClass[] = [];

  @Input() timeTableUnits: ITimetableUnitForEditDto[] = [];

  @Input() subjectDoublePeriod: ISubjectForCreateTimeTableWithDoublePeriod[] =
    [];

  @Input()
  subjectPracticeRoom: ISubjectForCreateTimeTableWithPracticeRoom[] = [];

  timeTableUnits2Dimensional: ITimetableUnitForEditDto[][] = [];

  startAts: number[] = Array.from({ length: 60 }, (v, k) => k + 1);

  constructor(
    private confirmationDialogService: ConfirmationDialogService,
    private timetablesService: TimetablesService
  ) {}

  ngOnInit(): void {
    this.timeTableUnits2Dimensional = this.initEmptyTimeTableUnits2Dimensional(
      this.classes,
      this.timeTableUnits
    );

    this.subjectDoublePeriod = this.subjectDoublePeriod.filter(
      (x) => x.isDoublePeriodSubjects === true
    );

    this.subjectPracticeRoom = this.subjectPracticeRoom.filter(
      (x) => x?.roomCount > 0
    );

    console.log('this.timeTableUnits', this.timeTableUnits);
  }

  private initEmptyTimeTableUnits2Dimensional(
    classes: IClass[],
    timeTableUnits: ITimetableUnitForEditDto[]
  ): ITimetableUnitForEditDto[][] {
    const timeTableUnits2Dimensional: ITimetableUnitForEditDto[][] = [];

    for (const klass of classes) {
      if (!timeTableUnits2Dimensional[klass.name]) {
        timeTableUnits2Dimensional[klass.name] = [];
      }

      for (let i = 1; i <= 60; i++) {
        const index = timeTableUnits.findIndex(
          (x) => x.startAt === i && x.className === klass.name
        );
        timeTableUnits2Dimensional[klass.name][i] = {
          ...timeTableUnits[index],
        };
      }
    }

    return timeTableUnits2Dimensional;
  }

  onCreateTimeTable(): void {
    this.timetableRequestParameters = {
      ...this.timetableRequestParameters,
      doublePeriodSubjects: this.subjectDoublePeriod,
      subjectsWithPracticeRoom: this.subjectPracticeRoom,
      fixedTimetableUnits: this.timeTableUnits.filter(
        (x) => x.priority === 0 && !!x.teacherId && !!x.subjectId && !!x.startAt
      ),
      noAssignTimetableUnits: this.timeTableUnits.filter(
        (x) => x.isNoAssignTimetableUnits === true
      ),
    };

    this.timetablesService
      .createTimeTable(this.timetableRequestParameters)
      .subscribe(
        () => {
          console.log('Tạo thời khóa biểu thành công');
        },
        (error) => {
          console.log(error.toString());
        }
      );

    console.log(
      'this.timetableRequestParameters',
      this.timetableRequestParameters
    );
  }
}
