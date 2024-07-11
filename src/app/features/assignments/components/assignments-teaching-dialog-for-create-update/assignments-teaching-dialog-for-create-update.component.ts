/* eslint-disable @typescript-eslint/no-explicit-any */
import { IYear } from '@features/years/interfaces';
import { IClass } from '@features/classes/interfaces';
import { ISubject } from '@features/subjects/interfaces';
import { ITeacher } from '@features/teachers/interfaces';
import { ISemester } from '@features/timetables/interfaces';
import { IAssignmentDto } from '@features/assignments/interfaces';
import { semesterData } from '@features/timetables/helpers/semester-data';
import { ISchoolShift } from '@features/school-shift/interfaces/i-school-shift';
import { schoolShiftData } from '@features/school-shift/helpers/school-shift-data';

import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import {
  Input,
  OnInit,
  Output,
  Component,
  EventEmitter,
  AfterViewInit,
  ChangeDetectorRef,
} from '@angular/core';

import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';

import { AppComponent } from 'src/app/app.component';

import { CoreModule } from '@core/core.module';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'smsedu-assignments-teaching-dialog-for-create-update',
  standalone: true,
  imports: [
    CoreModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    DropdownModule,
    InputNumberModule,
  ],
  templateUrl: './assignments-teaching-dialog-for-create-update.component.html',
})
export class AssignmentsTeachingDialogForCreateUpdateComponent
  implements OnInit, AfterViewInit
{
  isDialog: boolean = false;

  @Input() classes: IClass[] = [];

  @Input() teachers: ITeacher[] = [];

  @Input() semester: ISemester;

  @Input() year: IYear;

  @Input() schoolYears: IYear[] = [];

  subjects: ISubject[] = [];

  schoolShifts: ISchoolShift[] = schoolShiftData;

  schoolShiftName?: string;

  semesterData: ISemester[] = semesterData;

  assignmentDto: IAssignmentDto = {};

  @Output() save = new EventEmitter();

  // * Form Generator: Class
  _form: FormGroup = this.fb.group({
    id: [null],
    semester: [null, Validators.compose([Validators.required])],
    year: [null, Validators.compose([Validators.required])],
    class: [null, Validators.compose([Validators.required])],
    schoolShift: [null, Validators.compose([Validators.required])],
    teacher: [null, Validators.compose([Validators.required])],
    subject: [null, Validators.compose([Validators.required])],
    periodCount: [null, Validators.compose([Validators.required])],
  });

  constructor(
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    public app: AppComponent
  ) {}

  ngOnInit(): void {
    this._form.controls['semester'].setValue(this.semester);
    this._form.controls['year'].setValue(this.year);
    this._form.controls['periodCount'].setValue(0);

    this._form.get('semester').disable();
    this._form.get('year').disable();
    this._form.get('schoolShift').disable();
  }

  ngAfterViewInit(): void {
    this.cdr.detectChanges();
  }

  onHideDialog() {
    this.isDialog = false;
  }

  onSave() {
    console.log('Bùi Quốc Tĩnh 1');
    this.save.emit();
  }

  onChangeTeacher(event: any) {
    this.subjects = event.value.subjectTeachers.map((x) => x.subject);
  }

  onChangeClass(event: any) {
    this._form.controls['schoolShift'].setValue(
      this.schoolShifts[event.value.schoolShift]
    );

    console.log('Class', event);
  }

  onChangeSubject(event: any) {
    this._form.controls['periodCount'].setValue(
      this._form.value.class?.subjectClasses.find(
        (x) => x?.subject?.id === event.value?.id
      )?.periodCount
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  isCheckSubjectsEmpty() {
    return this.subjects?.length === 0 ? true : false;
  }

  onSetDTO(): void {
    this._form.get('semester').enable();
    this._form.get('year').enable();
    this._form.get('schoolShift').enable();

    this.assignmentDto = {
      periodCount: this._form.value.periodCount,
      semester: this._form.value.semester?.id,
      schoolShift: this._form.value.schoolShift?.id,
      startYear: this._form.value.year.startYear,
      endYear: this._form.value.year.endYear,
      teacherId: this._form.value.teacher?.id,
      teacherName: this._form.value.teacher.fullName,
      teacherShortName: this._form.value.teacher.shortName,
      subjectId: this._form.value.subject?.id,
      subjectName: this._form.value.subject.name,
      classId: this._form.value.class?.id,
      className: this._form.value.class.name,
    };

    this._form.get('semester').disable();
    this._form.get('year').disable();
    this._form.get('schoolShift').disable();
  }

  onCheckPeriodCount(periodCount?: number): string[] {
    const result = [];
    if (periodCount == null) {
      return result;
    }
    if (periodCount == 0) {
      result.push('Tiết học/Tuần lớn hơn 0');
    }

    const teacher = this._form.value.teacher;
    if (teacher?.periodCount + periodCount > 17) {
      result.push(
        'Giáo phân công còn tối đa ' +
          (17 - teacher.periodCount) +
          ' tiết học/Tuần'
      );
    }

    const klass = this._form.value.class;
    if (klass?.periodCount + periodCount > 30) {
      result.push('Lớp học còn ' + (30 - klass.periodCount) + ' tiết trống');
    }

    return result;
  }

  isDisabled(): boolean {
    console.log(this._form.invalid, this.onCheckPeriodCount().length > 0);
    return this._form.invalid || this.onCheckPeriodCount().length > 0;
  }
}
