import { IClassDto } from '@features/classes/interfaces/i-class';
import { ISchoolShift } from '@features/school-shift/interfaces/i-school-shift';
import { schoolShiftData } from '@features/school-shift/helpers/school-shift-data';

import { Output, Component, EventEmitter } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputMaskModule } from 'primeng/inputmask';
import { InputTextModule } from 'primeng/inputtext';

import { CoreModule } from '@core/core.module';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'smsedu-class-dialog-for-create-update',
  standalone: true,
  imports: [
    CoreModule,
    DialogModule,
    DropdownModule,
    ButtonModule,
    InputTextModule,
    InputMaskModule,
  ],
  templateUrl: './class-dialog-for-create-update.component.html',
})
export class ClassDialogForCreateUpdateComponent {
  dialog: boolean = false;

  classDto: IClassDto;

  grades: number[] = [10, 11, 12];

  schoolShifts: ISchoolShift[] = schoolShiftData;

  @Output() save = new EventEmitter();

  // * Form Generator: Class
  classForm: FormGroup = this.fb.group(
    {
      id: [null],
      name: [null, Validators.compose([Validators.required])],
      grade: [null, Validators.compose([Validators.required])],
      schoolShift: [null, Validators.compose([Validators.required])],
      year: [null, Validators.compose([Validators.required])],
    },
    {
      validators: [this.onCheckClassName, this.onCheckClassYear],
      // Thêm validator tại đây
    }
  );

  constructor(private fb: FormBuilder) {}

  onHideDialog() {
    this.dialog = false;
  }

  onSave() {
    this.save.emit();
  }

  // * --------------------- Function Helper --------------------
  onSetClassDTO(): void {
    this.classDto = {
      name: this.classForm.value.name,
      grade: this.classForm.value.grade,
      schoolShift: this.classForm.value.schoolShift.id,
      startYear: parseInt(this.classForm.value.year.slice(0, 4)),
      endYear: parseInt(this.classForm.value.year.slice(5, 9)),
    };
  }

  private onCheckClassName(g: FormGroup) {
    if (g.get('name').value == null || g.get('grade').value == null) {
      return null;
    }

    return g.get('name').value.slice(0, 2) == g.get('grade').value
      ? null
      : { checkClassName: true };
  }

  private onCheckClassYear(g: FormGroup) {
    if (g.get('year').value == null) {
      return null;
    }

    if (!/^\d+$/.test(g.get('year').value.slice(0, 4))) {
      return { checkClassYear: true };
    }

    if (!/^\d+$/.test(g.get('year').value.slice(5, 9))) {
      return { checkClassYear: true };
    }

    return parseInt(g.get('year').value.slice(0, 4)) + 1 ==
      parseInt(g.get('year').value.slice(5, 9))
      ? null
      : { checkClassYear: true };
  }
}
