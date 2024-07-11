/* eslint-disable @typescript-eslint/no-explicit-any */
import { IYear } from '@features/years/interfaces';
import { YearService } from '@features/years/services/year.service';
import { semesterData } from '@features/timetables/helpers/semester-data';
import { TimetablesService } from '@features/timetables/services/timetables.service';
import {
  ISemester,
  ITimetable,
  ITimetableRequestParametersForGet,
} from '@features/timetables/interfaces';

import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import {
  OnInit,
  Component,
  AfterViewInit,
  ChangeDetectorRef,
} from '@angular/core';

import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';

import { AppComponent } from 'src/app/app.component';

import { CoreModule } from '@core/core.module';
import { ConfirmationDialogService } from '@core/services/confirmation-dialog.service';
import { ConvertToVietnameseDatePipe } from '@core/pipes/convert-to-vietnamese-date.pipe';
import {
  IColumn,
  IPagination,
  ICustomAction,
  IRequestParameters,
} from '@core/interfaces';

import { SmseduCrudComponent } from '@shared/smsedu-crud/smsedu-crud.component';

import { TimetableEditComponent } from '../timetable-edit/timetable-edit.component';
import { TimetableViewComponent } from '../timetable-view/timetable-view.component';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'smsedu-timetable-list',
  standalone: true,
  imports: [
    CoreModule,
    DropdownModule,
    ButtonModule,
    SmseduCrudComponent,
    ConvertToVietnameseDatePipe,
  ],
  templateUrl: './timetable-list.component.html',
  providers: [
    ConfirmationDialogService,
    YearService,
    TimetablesService,
    DialogService,
  ],
})
export class TimetableListComponent implements OnInit, AfterViewInit {
  semesterData: ISemester[] = semesterData;

  // * Years
  schoolYears: IYear[] = [];

  paginationSchoolYears: IPagination;

  loadingSchoolYears: boolean = false;

  requestParametersForSchoolYears: IRequestParameters = {
    orderBy: 'startYear desc',
    pageSize: 50,
  };

  // * Timetables
  isFirstLoad: boolean = true;

  columns: IColumn[] = [];

  timetables: ITimetable[] = [];

  paginationTimetables: IPagination;

  loadingTimetables: boolean = false;

  customActions: ICustomAction[] = [];

  requestParametersForTimetables: ITimetableRequestParametersForGet = {};

  // * Form Generator
  _form: FormGroup = this.fb.group({
    schoolYear: [null, Validators.compose([Validators.required])],
    semester: [null, Validators.compose([Validators.required])],
  });

  ref: DynamicDialogRef | undefined;

  constructor(
    private fb: FormBuilder,
    private confirmationDialogService: ConfirmationDialogService,
    private cdr: ChangeDetectorRef,
    private yearService: YearService,
    public app: AppComponent,
    private timetablesService: TimetablesService,
    public dialogService: DialogService
  ) {}

  ngOnInit(): void {
    this._form.controls['semester'].setValue(this.semesterData[0]);
    this.getYears();

    this.columns = [
      { field: 'name', header: 'Tên thời khóa biểu', isSort: false },
      {
        field: 'createAt',
        header: 'Ngày tạo',
        isSort: false,
        pipe: new ConvertToVietnameseDatePipe(),
      },
      {
        field: 'updateAt',
        header: 'Ngày chỉnh sửa',
        isSort: false,
        pipe: new ConvertToVietnameseDatePipe(),
      },
    ];

    this.customActions = [
      {
        label: 'Xem',
        icon: 'pi pi-eye',
        color: 'success',
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        onClick: (evnet: Event, data: any) => {
          this.ref = this.dialogService.open(TimetableViewComponent, {
            header: `${data.name}`,
            width: '100%',
            maximizable: true,
            data: {
              classId: data.id,
            },
            contentStyle: { overflow: 'auto' },
          });
        },
      },
      {
        label: 'Chỉnh sửa',
        icon: 'pi pi-pencil',
        color: 'success',
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        onClick: (evnet: Event, data: any) => {
          this.ref = this.dialogService.open(TimetableEditComponent, {
            header: `${data.name}`,
            width: '100%',
            maximizable: true,
            data: {
              classId: data.id,
            },
            contentStyle: { overflow: 'auto' },
          });
        },
      },
    ];
  }

  ngAfterViewInit(): void {
    this.cdr.detectChanges();
  }

  onSplashScreenService(): void {
    if (this.loadingSchoolYears) {
      this.app.onShowSplashScreenService();
    } else {
      this.app.onHideSplashScreenService();
    }
  }

  // * Get Data Years
  private getYears(params?: IRequestParameters): void {
    this.loadingSchoolYears = true;
    this.onSplashScreenService();
    this.yearService.getYears(params).subscribe(
      (response) => {
        this.schoolYears = response.result.data.map((y) => ({
          ...y,
          name: y.startYear + '-' + y.endYear,
        }));

        this.paginationSchoolYears = response.pagination;

        this._form.controls['schoolYear'].setValue(this.schoolYears[0]);

        if (this.paginationSchoolYears?.hasNext) {
          this.requestParametersForSchoolYears.pageSize =
            this.paginationSchoolYears.totalCount;
          this.getYears(this.requestParametersForSchoolYears);
        } else {
          this.requestParametersForTimetables = {
            ...this.requestParametersForTimetables,
            startYear: this._form.controls['schoolYear'].value.startYear,
            endYear: this._form.controls['schoolYear'].value.endYear,
            semester: this._form.controls['semester'].value.id,
          };

          console.log(this.requestParametersForTimetables);
          this.getTimesTables(this.requestParametersForTimetables);
          this.loadingSchoolYears = false;
          this.onSplashScreenService();
        }
      },
      (error) => {
        console.log(error.toString());
        this.loadingSchoolYears = false;
        this.onSplashScreenService();
      }
    );
  }

  // * --------------------- Handel Function ---------------------
  // #region -- Load Classes --
  onLoadTimesTables(event: any): void {
    if (this.isFirstLoad) {
      this.isFirstLoad = false;
      return;
    }

    const { first, rows, sortField, sortOrder } = event;
    this.requestParametersForTimetables = {
      ...this.requestParametersForTimetables,
      pageNumber: first / rows + 1 || null,
      pageSize: rows || null,
      orderBy: sortField
        ? sortOrder == 1
          ? sortField
          : `${sortField} desc`
        : null,
    };

    this.getTimesTables(this.requestParametersForTimetables);
  }

  getTimesTables(params?: ITimetableRequestParametersForGet): void {
    this.loadingTimetables = true;
    this.timetablesService.getAllTimetables(params).subscribe(
      (response) => {
        console.log(response);
        this.timetables = response.result;
        this.paginationTimetables = response.pagination;
        this.loadingTimetables = false;
      },
      (error) => {
        this.loadingTimetables = false;
        console.log(error.toString());
      }
    );
  }
}
