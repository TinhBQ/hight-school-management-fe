import { IYear } from '@features/years/interfaces';
import { YearService } from '@features/years/services/year.service';

import {
  OnInit,
  Component,
  ViewChild,
  AfterViewInit,
  ChangeDetectorRef,
} from '@angular/core';

import { DropdownModule } from 'primeng/dropdown';
import { SplitterModule } from 'primeng/splitter';

import { AppComponent } from 'src/app/app.component';

import { CoreModule } from '@core/core.module';
import { IPagination, IRequestParameters } from '@core/interfaces';
import { TableExportService } from '@core/services/table-export.service';
import { ConfirmationDialogService } from '@core/services/confirmation-dialog.service';
import { MessageNotificationService } from '@core/services/message-notification.service';

import { ClassWithHomeroomTeachersAssignedComponent } from '../class-with-homeroom-teachers-assigned/class-with-homeroom-teachers-assigned.component';
import { ClassWithHomeroomTeachersUnassignedComponent } from '../class-with-homeroom-teachers-unassigned/class-with-homeroom-teachers-unassigned.component';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'smsedu-class-with-homeroom-teachers',
  standalone: true,
  imports: [
    CoreModule,
    SplitterModule,
    DropdownModule,
    ClassWithHomeroomTeachersUnassignedComponent,
    ClassWithHomeroomTeachersAssignedComponent,
  ],
  templateUrl: './class-with-homeroom-teachers.component.html',
  providers: [
    TableExportService,
    ConfirmationDialogService,
    MessageNotificationService,
    YearService,
  ],
})
export class ClassWithHomeroomTeachersComponent
  implements OnInit, AfterViewInit
{
  selectYear: IYear;

  schoolYears: IYear[] = [];

  paginationSchoolYears: IPagination;

  loadingSchoolYears: boolean = false;

  requestParametersForSchoolYears: IRequestParameters = {
    orderBy: 'startYear desc',
    pageSize: 100,
  };

  @ViewChild(ClassWithHomeroomTeachersAssignedComponent)
  classWithHomeroomTeachersAssignedComponent: ClassWithHomeroomTeachersAssignedComponent;

  @ViewChild(ClassWithHomeroomTeachersUnassignedComponent)
  classWithHomeroomTeachersUnassignedComponent: ClassWithHomeroomTeachersUnassignedComponent;

  constructor(
    private messageNotificationService: MessageNotificationService,
    private confirmationDialogService: ConfirmationDialogService,
    private tableExportService: TableExportService,
    private cdr: ChangeDetectorRef,
    public app: AppComponent,
    private yearService: YearService
  ) {}

  ngOnInit(): void {
    this.getYears(this.requestParametersForSchoolYears);
  }

  ngAfterViewInit(): void {
    this.cdr.detectChanges();
  }

  // * Get Data Years
  private getYears(params?: IRequestParameters): void {
    this.loadingSchoolYears = true;
    this.app.onShowSplashScreenService();
    this.yearService.getYears(params).subscribe(
      (response) => {
        this.schoolYears = response.result.data.map((y) => ({
          ...y,
          name: y.startYear + '-' + y.endYear,
        }));

        this.paginationSchoolYears = response.pagination;

        if (this.paginationSchoolYears?.hasNext) {
          this.requestParametersForSchoolYears.pageSize =
            this.paginationSchoolYears.totalCount;

          this.getYears(this.requestParametersForSchoolYears);
        } else {
          this.selectYear = this.schoolYears[0];

          this.classWithHomeroomTeachersAssignedComponent.year =
            this.schoolYears[0];
          this.classWithHomeroomTeachersAssignedComponent.onCLear();

          this.classWithHomeroomTeachersUnassignedComponent.year =
            this.schoolYears[0];
          this.classWithHomeroomTeachersUnassignedComponent.onCLear();

          this.loadingSchoolYears = false;
          this.app.onHideSplashScreenService();
        }
      },
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      (error) => {
        this.loadingSchoolYears = false;
        this.app.onHideSplashScreenService();
      }
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
  onChangeYear(event: any): void {
    this.classWithHomeroomTeachersAssignedComponent.year = event.value;
    this.classWithHomeroomTeachersAssignedComponent.onCLear();

    this.classWithHomeroomTeachersUnassignedComponent.year = event.value;
    this.classWithHomeroomTeachersUnassignedComponent.onCLear();
  }
}
