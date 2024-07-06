/* eslint-disable @typescript-eslint/no-explicit-any */
import { SubjectService } from '@features/subjects/services/subject.service';
import { ISubjectsTeachersDto } from '@features/subjects-teachers/interfaces';
import { SubjectsTeachersService } from '@features/subjects-teachers/services/subjects-teachers.service';

import { Input, OnInit, Component, ChangeDetectorRef } from '@angular/core';

import { ChipModule } from 'primeng/chip';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';

import { CoreModule } from '@core/core.module';
import { ConfirmationDialogService } from '@core/services/confirmation-dialog.service';
import { MessageNotificationService } from '@core/services/message-notification.service';

import { SubjectsForTeacherComponent } from '../subjects-for-teacher/subjects-for-teacher.component';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'smsedu-subjects-for-teacher-unassigned',
  standalone: true,
  imports: [
    CoreModule,
    TableModule,
    CheckboxModule,
    ButtonModule,
    ChipModule,
    SubjectsForTeacherComponent,
  ],
  templateUrl: './subjects-for-teacher-unassigned.component.html',
  providers: [
    SubjectService,
    ConfirmationDialogService,
    SubjectsTeachersService,
    MessageNotificationService,
  ],
})
export class SubjectsForTeacherUnassignedComponent implements OnInit {
  @Input() teacherId: string = '67174939-7dbf-44b7-a94d-42f3cc73457a';

  subjectsForTeacher: ISubjectsTeachersDto[] = [];

  constructor(
    private config: DynamicDialogConfig,
    private subjectService: SubjectService,
    private cdr: ChangeDetectorRef,
    private confirmationDialogService: ConfirmationDialogService,
    private subjectsTeachersService: SubjectsTeachersService,
    private messageNotificationService: MessageNotificationService,
    private subjectsForTeacherComponent: SubjectsForTeacherComponent
  ) {}

  ngOnInit(): void {
    if (this.config.data && this.config.data.teacherId) {
      this.teacherId = this.config.data.teacherId;
      this.cdr.detectChanges();
    }

    this.getUnassignedSubjectsForTeacher();
  }

  getUnassignedSubjectsForTeacher(): void {
    this.subjectService
      .getUnassignedSubjectsByTeacherId(this.teacherId)
      .subscribe(
        (response) => {
          this.subjectsForTeacher = response.data.map((subject) => {
            return {
              teacherId: this.teacherId,
              subjectId: subject.id,
              subject: subject,
              isMain: null,
            } as ISubjectsTeachersDto;
          });
        },
        (error) => {
          console.log(error.toString());
        }
      );
  }

  onCreate(event: Event, subjectTeacher: ISubjectsTeachersDto): void {
    this.confirmationDialogService.confirm(event, () => {
      this.subjectsTeachersService.create(subjectTeacher).subscribe(
        () => {
          this.messageNotificationService.showSuccess(
            'Thêm phân công thành công!'
          );

          this.onCLear();
          this.subjectsForTeacherComponent.onClear();
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

  onCreateCollection(event: Event): void {
    this.confirmationDialogService.confirm(event, () => {
      this.subjectsTeachersService
        .createCollection(
          this.subjectsForTeacher.filter((item) => item.isMain !== null)
        )
        .subscribe(
          () => {
            this.messageNotificationService.showSuccess(
              'Thêm danh sách phân công thành công!'
            );
            this.subjectsForTeacherComponent.onClear();
            this.onCLear();
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

  lengthItemAdd(): number {
    return this.subjectsForTeacher.filter((item) => item.isMain !== null)
      .length;
  }

  onCLear(): void {
    this.subjectsForTeacher = [];
    this.getUnassignedSubjectsForTeacher();
  }
}
