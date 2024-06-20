import { ITeacherDto } from '@features/teachers/interfaces';

import { Output, Component, EventEmitter } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';

import { splitFullName } from '@core/utils';
import { CoreModule } from '@core/core.module';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'smsedu-teacher-dialog-for-create-update',
  standalone: true,
  imports: [CoreModule, DialogModule, InputTextModule, ButtonModule],
  templateUrl: './teacher-dialog-for-create-update.component.html',
})
export class TeacherDialogForCreateUpdateComponent {
  dialog: boolean = false;

  teacherDto: ITeacherDto;

  @Output() save = new EventEmitter();

  formGroup: FormGroup = this.fb.group({
    id: [null],
    fullName: [null, Validators.compose([Validators.required])],
    shortName: [null, Validators.compose([Validators.required])],
  });

  constructor(private fb: FormBuilder) {}

  onHideDialog() {
    this.dialog = false;
  }

  onSave() {
    this.save.emit();
  }

  // * --------------------- Function Helper --------------------
  onSetDTO(): void {
    const split = splitFullName(this.formGroup.value.fullName);

    this.teacherDto = {
      firstName: split[0],
      middleName: split[1],
      lastName: split[2],
      shortName: this.formGroup.value.shortName,
    };
    console.log(this.teacherDto);
  }
}
