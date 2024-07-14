import { ISubjectsTeachersDto } from '@features/subjects-teachers/interfaces';

import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import {
  Output,
  Component,
  EventEmitter,
  AfterViewInit,
  ChangeDetectorRef,
} from '@angular/core';

import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';

import { CoreModule } from '@core/core.module';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'smsedu-subjects-for-teacher-update-is-main',
  standalone: true,
  imports: [
    CoreModule,
    DialogModule,
    ButtonModule,
    CheckboxModule,
    InputTextModule,
  ],
  templateUrl: './subjects-for-teacher-update-is-main.component.html',
})
export class SubjectsForTeacherUpdateIsMainComponent implements AfterViewInit {
  dialogVisible: boolean = false;

  subjectTeacherDto: ISubjectsTeachersDto;

  prevIsMain: boolean = false;

  @Output() save = new EventEmitter();

  _form: FormGroup = this.fb.group({
    id: [null],
    teacher: [null, Validators.compose([Validators.required])],
    subject: [null, Validators.compose([Validators.required])],
    isMain: [null, Validators.compose([Validators.required])],
  });

  constructor(
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {}

  ngAfterViewInit(): void {
    this.cdr.detectChanges();
  }

  onHideDialog() {
    this.dialogVisible = false;
  }

  onSave() {
    this.save.emit();
  }

  onSetDto(): void {
    this.subjectTeacherDto = {
      subjectId: this._form.value.subject.id,
      teacherId: this._form.value.teacher.id,
      isMain: this._form.value.isMain,
    };
  }

  isDisabled() {
    return this._form.value.isMain.value === this.prevIsMain;
  }
}
