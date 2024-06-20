/* eslint-disable @typescript-eslint/no-explicit-any */
import { TeacherService } from '@features/teachers/services/teacher.service';
import {
  ITeacher,
  ITeachersForClassRequestParameters,
} from '@features/teachers/interfaces';
import { HomeroomAssignmentsService } from '@features/homeroom-assignments/services/homeroom-assignments.service';
import {
  IHomeroomAssignment,
  IHomeroomAssignmentRequestParameters,
} from '@features/homeroom-assignments/interfaces';

import { OnInit, Component } from '@angular/core';

import { TableModule } from 'primeng/table';
import { ScrollerOptions } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { AutoCompleteModule } from 'primeng/autocomplete';

import { IPagination } from '@core/interfaces';
import { CoreModule } from '@core/core.module';
import { ConfirmationDialogService } from '@core/services/confirmation-dialog.service';
import { MessageNotificationService } from '@core/services/message-notification.service';
import { SmseduScrollTrackerDirective } from '@core/directives/smsedu-scroll-tracker.directive';

@Component({
  selector: 'app-homeroom-assignment-for-classes',
  standalone: true,
  imports: [
    CoreModule,
    TableModule,
    InputNumberModule,
    ButtonModule,
    AutoCompleteModule,
    SmseduScrollTrackerDirective,
  ],
  templateUrl: './homeroom-assignment-for-classes.component.html',
  providers: [
    HomeroomAssignmentsService,
    TeacherService,
    ConfirmationDialogService,
    MessageNotificationService,
  ],
})
export class HomeroomAssignmentForClassesComponent implements OnInit {
  listAssignedHomeroom: IHomeroomAssignment[] = [];

  listUnAssignedHomeroom: IHomeroomAssignment[] = [];

  teachesUnAssignedHomeroom: ITeacher[] = [];

  paginationForTeachesUnAssignedHomeroom: IPagination;

  requestParametersForAssignedHomeroom: IHomeroomAssignmentRequestParameters = {
    isAssignedHomeroom: true,
  };

  requestParametersForUnAssignedHomeroom: IHomeroomAssignmentRequestParameters =
    {
      isAssignedHomeroom: false,
    };

  requestParametersForTeachesUnAssignedHomeroom: ITeachersForClassRequestParameters =
    {
      isAssignedHomeroom: false,
    };

  loading: boolean = false;

  lastQuery: string = '';

  ngOnInit(): void {
    this.getListAssignedHomeroom();
    this.getListUnAssignedHomeroom();
    this.initListTeachesUnAssignedHomeroom();
  }

  options: ScrollerOptions = {
    showLoader: true,
    disabled: this.loading,
    lazy: true,
    itemSize: 35,
    onLazyLoad: this.loadDataOnLazyLoad.bind(this),
  };

  search(event) {
    const query = event.query;
    this.requestParametersForTeachesUnAssignedHomeroom = {
      pageNumber: null,
      pageSize: null,
      searchTerm: query,
      isAssignedHomeroom: false,
      fields: null,
      orderBy: null,
    };
    this.teachesUnAssignedHomeroom = [];
    this.loadDataTeachesUnAssignedHomeroom(
      this.requestParametersForTeachesUnAssignedHomeroom
    );
  }

  loadDataTeachesUnAssignedHomeroom(
    requestParametersForTeachesUnAssignedHomeroom: ITeachersForClassRequestParameters
  ): void {
    this.loading = true;

    this.teacherService
      .find(requestParametersForTeachesUnAssignedHomeroom)
      .subscribe(
        (response) => {
          if (response.pagination.currentPage === 1) {
            this.teachesUnAssignedHomeroom = response.result.data;
          } else {
            this.teachesUnAssignedHomeroom = [
              ...this.teachesUnAssignedHomeroom,
              ...response.result.data,
            ];
          }
          this.paginationForTeachesUnAssignedHomeroom = response.pagination;
          this.loading = false;
        },
        (error) => {
          console.log(error.toString());
          this.loading = false;
        }
      );
  }

  loadDataOnLazyLoad(event: any) {
    const { first, last } = event;
    const rows = last - first;

    if (
      first + rows >= this.teachesUnAssignedHomeroom.length &&
      this.paginationForTeachesUnAssignedHomeroom.hasNext &&
      !this.loading
    ) {
      this.requestParametersForTeachesUnAssignedHomeroom.pageNumber =
        this.paginationForTeachesUnAssignedHomeroom.currentPage + 1;
      this.loadDataTeachesUnAssignedHomeroom(
        this.requestParametersForTeachesUnAssignedHomeroom
      );
    }
  }

  onSelectTeacher(event, data) {
    console.log('selected', event);
    console.log(data);

    this.confirmationDialogService.confirm(event, () => {
      this.homeroomAssignmentsService
        .update(data.id, { homeroomTeacherId: event.value.id })
        .subscribe(
          () => {
            this.messageNotificationService.showSuccess(
              'Thêm danh sách lớp tành công!'
            );
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

  constructor(
    private homeroomAssignmentsService: HomeroomAssignmentsService,
    private teacherService: TeacherService,
    private confirmationDialogService: ConfirmationDialogService,
    private messageNotificationService: MessageNotificationService
  ) {}

  private getListAssignedHomeroom(): void {
    this.homeroomAssignmentsService
      .find(this.requestParametersForAssignedHomeroom)
      .subscribe(
        (response) => {
          this.listAssignedHomeroom = response.result.data;
        },
        (error) => {
          console.log(error.toString());
        }
      );
  }

  private getListUnAssignedHomeroom(): void {
    this.homeroomAssignmentsService
      .find(this.requestParametersForUnAssignedHomeroom)
      .subscribe(
        (response) => {
          this.listAssignedHomeroom = response.result.data;
          this.paginationForTeachesUnAssignedHomeroom = response.pagination;
        },
        (error) => {
          console.log(error.toString());
        }
      );
  }

  private getListTeachesUnAssignedHomeroom(
    requestParametersForTeachesUnAssignedHomeroom: ITeachersForClassRequestParameters
  ): void {
    this.teacherService
      .find(requestParametersForTeachesUnAssignedHomeroom)
      .subscribe(
        (response) => {
          this.teachesUnAssignedHomeroom = response.result.data;
          this.paginationForTeachesUnAssignedHomeroom = response.pagination;
        },
        (error) => {
          console.log(error.toString());
        }
      );
  }

  private initListTeachesUnAssignedHomeroom(): void {
    this.requestParametersForTeachesUnAssignedHomeroom = {
      pageNumber: null,
      pageSize: 10,
      searchTerm: null,
      isAssignedHomeroom: false,
      fields: null,
      orderBy: null,
    };
    this.getListTeachesUnAssignedHomeroom(
      this.requestParametersForTeachesUnAssignedHomeroom
    );
  }
}
