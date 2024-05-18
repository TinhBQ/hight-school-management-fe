import { IClassDto } from '@features/classes/interfaces/i-class';
import { ClassService } from '@features/classes/services/class.service';
import { ISchoolShift } from '@features/school-shift/interfaces/i-school-shift';
import { schoolShiftData } from '@features/school-shift/helpers/school-shift-data';

import { CommonModule } from '@angular/common';
import { OnInit, Component } from '@angular/core';
import {
  FormGroup,
  Validators,
  FormBuilder,
  ReactiveFormsModule,
} from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { InputMaskModule } from 'primeng/inputmask';
import { AutoCompleteModule } from 'primeng/autocomplete';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'smsedu-class-crud',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AutoCompleteModule,
    InputTextModule,
    DropdownModule,
    InputMaskModule,
    ButtonModule,
  ],
  templateUrl: './class-crud.component.html',
  providers: [ClassService],
})
export class ClassCreateComponent implements OnInit {
  grades: number[];

  schoolShifts: ISchoolShift[];

  klass: IClassDto;

  // * classForm
  classForm: FormGroup = this.fb.group(
    {
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

  // * constructor
  constructor(
    private fb: FormBuilder,
    private classService: ClassService
  ) {}

  // *  ngOnInit
  ngOnInit(): void {
    this.grades = [10, 11, 12];
    this.schoolShifts = schoolShiftData;
  }

  // * Handel on save Class
  onSaveClass(): void {
    if (this.classForm.valid) {
      console.log(this.classForm.value);
      this.klass = {
        name: this.classForm.value.name,
        grade: this.classForm.value.grade,
        schoolShift: this.classForm.value.schoolShift.id,
        startYear: parseInt(this.classForm.value.year.slice(0, 4)),
        endYear: parseInt(this.classForm.value.year.slice(5, 9)),
      };
      console.log(this.klass);
      this.classService.create(this.klass).subscribe();
    }
  }

  // * Custom validation function
  onCheckClassName(g: FormGroup) {
    if (g.get('name').value == null || g.get('grade').value == null) {
      return null;
    }

    return g.get('name').value.slice(0, 2) == g.get('grade').value
      ? null
      : { checkClassName: true };
  }

  onCheckClassYear(g: FormGroup) {
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
