import { ISubjectClassDto } from '@features/subject-class/interfaces';
import { SubjectService } from '@features/subjects/services/subject.service';
import {
  SubjectClassService,
  SubjectsForClassService,
} from '@features/subject-class/services';

import { FormsModule } from '@angular/forms';
import {
  Input,
  OnInit,
  Component,
  AfterViewInit,
  ChangeDetectorRef,
} from '@angular/core';

import { ChipModule } from 'primeng/chip';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';

import { AppComponent } from 'src/app/app.component';

import { CoreModule } from '@core/core.module';
import { ConfirmationDialogService } from '@core/services/confirmation-dialog.service';
import { MessageNotificationService } from '@core/services/message-notification.service';

import { SubjectsForClassComponent } from '../subjects-for-class/subjects-for-class.component';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'smsedu-subjects-for-class-unassigned',
  standalone: true,
  imports: [
    CoreModule,
    TableModule,
    InputNumberModule,
    FormsModule,
    ButtonModule,
    SubjectsForClassComponent,
    ChipModule,
  ],
  templateUrl: './subjects-for-class-unassigned.component.html',
  styleUrl: './subjects-for-class-unassigned.component.scss',
  providers: [
    SubjectsForClassService,
    SubjectClassService,
    SubjectService,
    MessageNotificationService,
    ConfirmationDialogService,
  ],
})
export class SubjectsForClassUnassignedComponent
  implements OnInit, AfterViewInit
{
  @Input() classId: string = '';

  subjectsForClass: ISubjectClassDto[] = [];

  constructor(
    private messageNotificationService: MessageNotificationService,
    private subjectsForClassComponent: SubjectsForClassComponent,
    private confirmationDialogService: ConfirmationDialogService,
    private subjectClassService: SubjectClassService,
    private subjectService: SubjectService,
    private config: DynamicDialogConfig,
    private cdr: ChangeDetectorRef,
    public app: AppComponent
  ) {}

  ngOnInit(): void {
    if (this.config.data && this.config.data.classId) {
      this.classId = this.config.data.classId;
    }

    this.getUnassignedSubjectsForClass();
  }

  ngAfterViewInit(): void {
    this.cdr.detectChanges();
  }

  // * --------------------- Load Unassigned Classes for Table --------------------
  getUnassignedSubjectsForClass(): void {
    this.subjectService.getUnassignedSubjectsByClassId(this.classId).subscribe(
      (response) => {
        this.subjectsForClass = response.data.map((subject) => {
          return {
            classId: this.classId,
            subjectId: subject.id,
            subject: subject,
            periodCount: 0,
          } as ISubjectClassDto;
        });
      },
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      (error) => {
        this.messageNotificationService.showError('Đã xảy ra lỗi.');
      }
    );
  }

  isDisabled(): number {
    return this.subjectsForClass.filter((subject) => subject.periodCount > 0)
      .length;
  }

  onCreate(event: Event, subjectClass: ISubjectClassDto): void {
    this.confirmationDialogService.confirm(event, () => {
      this.app.onShowSplashScreenService();
      this.subjectClassService.create(subjectClass).subscribe(
        () => {
          this.messageNotificationService.showSuccess(
            'Thêm phân công thành công!'
          );
          this.subjectsForClassComponent.smseduCrudComponent.onclear();
          this.onCLear();
          this.subjectsForClassComponent.onClose();
          this.app.onHideSplashScreenService();
        },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        (error) => {
          this.messageNotificationService.showError('Đã xảy ra lỗi.');
          this.app.onHideSplashScreenService();
        }
      );
    });
  }

  onCreateCollection(event: Event): void {
    this.confirmationDialogService.confirm(event, () => {
      this.app.onShowSplashScreenService();
      this.subjectClassService
        .createCollection(
          this.subjectsForClass.filter(
            (subject) => subject.periodCount > 0
          ) as ISubjectClassDto[]
        )
        .subscribe(
          () => {
            this.messageNotificationService.showSuccess(
              'Thêm danh sách phân công thành công!'
            );
            this.getUnassignedSubjectsForClass();
            this.app.onHideSplashScreenService();
          },
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          (error) => {
            this.messageNotificationService.showError('Đã xảy ra lỗi.');
            this.app.onHideSplashScreenService();
          }
        );
    });
  }

  onCLear(): void {
    this.subjectsForClass = [];
    this.getUnassignedSubjectsForClass();
  }
}
