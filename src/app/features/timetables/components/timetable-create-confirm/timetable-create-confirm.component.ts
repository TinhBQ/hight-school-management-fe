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

import {
  Input,
  OnInit,
  Component,
  AfterViewInit,
  ChangeDetectorRef,
} from '@angular/core';

import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { MessagesModule } from 'primeng/messages';

import { AppComponent } from 'src/app/app.component';

import { generateGUID } from '@core/utils';
import { CoreModule } from '@core/core.module';
import { ConfirmationDialogService } from '@core/services/confirmation-dialog.service';
import { MessageNotificationService } from '@core/services/message-notification.service';

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
    MessagesModule,
  ],
  templateUrl: './timetable-create-confirm.component.html',
  providers: [
    TimetablesService,
    ConfirmationDialogService,
    MessageNotificationService,
  ],
})
export class TimetableCreateConfirmComponent implements OnInit, AfterViewInit {
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
    private timetablesService: TimetablesService,
    public app: AppComponent,
    private messageNotificationService: MessageNotificationService,
    private cdr: ChangeDetectorRef
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
  }

  ngAfterViewInit(): void {
    this.cdr.detectChanges();
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
    this.confirmationDialogService.confirm(event, () => {
      this.app.onShowSplashScreenService();
      this.timetableRequestParameters = {
        ...this.timetableRequestParameters,

        doublePeriodSubjects: this.subjectDoublePeriod,
        subjectsWithPracticeRoom: this.subjectPracticeRoom,
        fixedTimetableUnits: this.timeTableUnits
          .filter(
            (x) =>
              x.priority === 0 && !!x.teacherId && !!x.subjectId && !!x.startAt
          )
          .map((x) => ({
            ...x,
            id: generateGUID(),
          })),
        freeTimetableUnits: this.timeTableUnits
          .filter((x) => x.isNoAssignTimetableUnits === true)
          .map((x) => ({
            ...x,
            id: generateGUID(),
          })),
      };

      this.timetablesService
        .createTimeTable(this.timetableRequestParameters)
        .subscribe(
          () => {
            this.messageNotificationService.showSuccess(
              'Tạo thời khóa biểu thành công!'
            );
            this.app.onHideSplashScreenService();
          },
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          (error) => {
            this.messageNotificationService.showSuccess(
              'Tạo thời khóa biểu không thành công!'
            );
            this.app.onHideSplashScreenService();
          }
        );
    });
  }
}
