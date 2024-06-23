/* eslint-disable @typescript-eslint/no-explicit-any */
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { SubjectsTeachersService } from '@features/subjects-teachers/services/subjects-teachers.service';
import {
  ISubjectsTeachers,
  ISubjectsForTeacherRequestParameters,
} from '@features/subjects-teachers/interfaces';

import {
  Input,
  OnInit,
  Component,
  ViewChild,
  ChangeDetectorRef,
} from '@angular/core';

import { SplitterModule } from 'primeng/splitter';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';

import { CoreModule } from '@core/core.module';
import {
  IColumn,
  IPagination,
  ICustomAction,
  IResponseBase,
} from '@core/interfaces';

import { SmseduCrudComponent } from '@shared/smsedu-crud/smsedu-crud.component';

import { SubjectsForTeacherUnassignedComponent } from '../subjects-for-teacher-unassigned/subjects-for-teacher-unassigned.component';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'smsedu-subjects-for-teacher',
  standalone: true,
  imports: [
    CoreModule,
    SplitterModule,
    SmseduCrudComponent,
    SubjectsForTeacherUnassignedComponent,
  ],
  templateUrl: './subjects-for-teacher.component.html',
  providers: [SubjectsTeachersService, DynamicDialogConfig],
})
export class SubjectsForTeacherComponent implements OnInit {
  @Input() teacherId: string = '67174939-7dbf-44b7-a94d-42f3cc73457a';

  columns: IColumn[] = [];

  result: IResponseBase<ISubjectsTeachers[]>;

  pagination: IPagination;

  loading: boolean = false;

  searchString = '';

  searchText$ = new Subject<string>();

  customActions: ICustomAction[] = [];

  requestParameters: ISubjectsForTeacherRequestParameters;

  @ViewChild(SmseduCrudComponent)
  smseduCrudComponent: SmseduCrudComponent;

  constructor(
    private subjectsTeachersService: SubjectsTeachersService,
    private config: DynamicDialogConfig,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    if (this.config.data && this.config.data.teacherId) {
      this.teacherId = this.config.data.teacherId; // Lấy classId từ config.data
      this.requestParameters.teacherId = this.config.data.teacherId;
      this.cdr.detectChanges();
    }

    this.searchText$
      .pipe(debounceTime(1000), distinctUntilChanged())
      .subscribe((packageName) => {
        this.requestParameters.searchTerm = packageName;
        return this.getSubjectsForTeacher(this.requestParameters);
      });
  }

  onLoadSubjectsForTeacher(event: any): void {
    const { first, rows, sortField, sortOrder } = event;

    this.requestParameters = {
      teacherId: this.teacherId,
      pageNumber: first / rows + 1 || null,
      pageSize: rows || null,
      orderBy: sortField
        ? sortOrder == 1
          ? sortField
          : `${sortField} desc`
        : null,
    };

    this.columns = [
      { field: 'subject.name', header: 'Giáo viên', isSort: false },
      { field: 'subject.name', header: 'Môn học', isSort: false },
      { field: 'isMain', header: 'Môn chính', isSort: false },
    ];

    this.getSubjectsForTeacher(this.requestParameters);
  }

  private getSubjectsForTeacher(
    params: ISubjectsForTeacherRequestParameters
  ): void {
    this.loading = true;
    this.subjectsTeachersService.find(params).subscribe(
      (response) => {
        this.result = response.result;
        this.pagination = response.pagination;
        this.loading = false;
        this.cdr.detectChanges(); // Mark for change detection
      },
      (error) => {
        console.log(error.toString());
      }
    );
  }
}
