import { ISubjectClassDto } from '@features/subject-class/interfaces';
import { SubjectService } from '@features/subjects/services/subject.service';
import {
  SubjectClassService,
  SubjectsForClassService,
} from '@features/subject-class/services';

import { FormsModule } from '@angular/forms';
import { Input, OnInit, Component } from '@angular/core';

import { ChipModule } from 'primeng/chip';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';

import { CoreModule } from '@core/core.module';
import { ConfirmationDialogService } from '@core/services/confirmation-dialog.service';
import { MessageNotificationService } from '@core/services/message-notification.service';

import { SubjectsForClassComponent } from '../subjects-for-class/subjects-for-class.component';

@Component({
  selector: 'app-subjects-for-class-unassigned',
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
export class SubjectsForClassUnassignedComponent implements OnInit {
  @Input() classId: string = 'eaeea2ab-abc7-4aba-b48e-c97aa4c8559d';

  subjectsForClass: ISubjectClassDto[] = [];

  constructor(
    private messageNotificationService: MessageNotificationService,
    private subjectsForClassComponent: SubjectsForClassComponent,
    private confirmationDialogService: ConfirmationDialogService,
    private subjectClassService: SubjectClassService,
    private subjectService: SubjectService,
    private config: DynamicDialogConfig
  ) {}

  ngOnInit(): void {
    console.log('Bùi Quốc Tĩnh');
    if (this.config.data && this.config.data.classId) {
      this.classId = this.config.data.classId; // Lấy classId từ config.data
    }

    this.getUnassignedSubjectsForClass();
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
      (error) => {
        console.log(error.toString());
      }
    );
  }

  isDisabled(): number {
    return this.subjectsForClass.filter((subject) => subject.periodCount > 0)
      .length;
  }

  onCreate(event: Event, subjectClass: ISubjectClassDto): void {
    this.confirmationDialogService.confirm(event, () => {
      this.subjectClassService.create(subjectClass).subscribe(
        () => {
          this.messageNotificationService.showSuccess(
            'Thêm phân công thành công!'
          );
          this.subjectsForClassComponent.smseduCrudComponent.onclear();
          this.subjectsForClassComponent.onClose();
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
}
