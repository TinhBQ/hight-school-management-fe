import { Component, ChangeDetectorRef } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';

import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';

import { CoreModule } from '@core/core.module';

import { LogoMainComponent } from '@shared/smsedu-logo/logo-main/logo-main.component';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'smsedu-login',
  standalone: true,
  imports: [
    CoreModule,
    CardModule,
    LogoMainComponent,
    CheckboxModule,
    ButtonModule,
    InputTextModule,
  ],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  checked = false;

  blockedUI = false;

  loginForm: FormGroup = this.fb.group({
    username: [
      '',
      Validators.compose([
        Validators.required,
        Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/),
      ]),
    ],
    password: [
      '',
      Validators.compose([
        Validators.required,
        Validators.pattern(
          /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@#$%&])[A-Za-z\d@#$%&]{8,}$/
        ),
      ]),
    ],
    isForgotPassword: false,
  });

  constructor(
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {}

  get username() {
    return this.loginForm.controls['username'];
  }

  get password() {
    return this.loginForm.controls['password'];
  }

  get isForgotPassword() {
    return this.loginForm.controls['isForgotPassword'];
  }
}
