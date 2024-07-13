import { AuthService } from '@features/auth/services/auth.service';

import { Router } from '@angular/router';
import { Component, ChangeDetectorRef } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';

import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';

import { paths } from 'src/app/routes/paths';

import { CoreModule } from '@core/core.module';
import { MessageNotificationService } from '@core/services/message-notification.service';

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
  providers: [MessageNotificationService],
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
    private cdr: ChangeDetectorRef,
    private authService: AuthService,
    private router: Router,
    private messageNotificationService: MessageNotificationService
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

  onSubmit() {
    this.blockedUI = true;
    this.authService
      .onLogin({ username: this.username.value, password: this.password.value })
      .subscribe(
        (response) => {
          // Xử lý kết quả sau khi đăng nhập thành công
          const { token } = response;
          localStorage.setItem('accessToken', token);

          this.router.navigate([paths.smsedu.root]);
          this.messageNotificationService.showSuccess('Đăng nhập thành công.');
        },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        (error) => {
          this.messageNotificationService.showError(
            'Tên đăng nhập hoặc mật khẩu lỗi.'
          );
        }
      )
      .add(() => {
        this.blockedUI = false;
        this.cdr.markForCheck(); // Đánh giấu sự thay đổi
      });
  }
}
