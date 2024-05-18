import { ISubjectDto } from '@features/subjects/interfaces';

import { CommonModule } from '@angular/common';
import { Output, Component, EventEmitter } from '@angular/core';
import {
  FormGroup,
  Validators,
  FormBuilder,
  ReactiveFormsModule,
} from '@angular/forms';

import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'smsedu-subject-dialog-for-create-update',
  standalone: true,
  imports: [
    CommonModule,
    DialogModule,
    ReactiveFormsModule,
    InputTextModule,
    ButtonModule,
  ],
  templateUrl: './subject-dialog-for-create-update.component.html',
})
export class SubjectDialogForCreateUpdateComponent {
  subjectDialog: boolean = false;

  subjectDto: ISubjectDto;

  @Output() save = new EventEmitter();

  // * Form Generator: Class
  subjectForm: FormGroup = this.fb.group({
    id: [null],
    name: [null, Validators.compose([Validators.required])],
    shortName: [null, Validators.compose([Validators.required])],
  });

  constructor(private fb: FormBuilder) {}

  onHideDialog() {
    this.subjectDialog = false;
  }

  onSave() {
    this.save.emit();
  }

  // * --------------------- Function Helper --------------------
  onSetSubjectDTO(): void {
    this.subjectDto = {
      name: this.subjectForm.value.name,
      shortName: this.subjectForm.value.shortName,
    };
  }
}
