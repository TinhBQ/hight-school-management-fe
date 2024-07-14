import { AuthService } from '@features/auth/services/auth.service';

import { Router } from '@angular/router';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { Component, AfterViewInit, ChangeDetectorRef } from '@angular/core';

import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { BlockUIModule } from 'primeng/blockui';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';

import { paths } from 'src/app/routes/paths';
import { AppComponent } from 'src/app/app.component';

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
    BlockUIModule,
  ],
  templateUrl: './login.component.html',
  providers: [MessageNotificationService],
})
export class LoginComponent implements AfterViewInit {
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
    private authService: AuthService,
    private router: Router,
    private messageNotificationService: MessageNotificationService,
    private cdr: ChangeDetectorRef,
    public app: AppComponent
  ) {}

  ngAfterViewInit(): void {
    this.cdr.detectChanges();
  }

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
          const { token } = response;
          localStorage.setItem('accessToken', token);

          this.router.navigate([paths.smsedu.root]);
          this.messageNotificationService.showSuccess('Đăng nhập thành công.');
          this.blockedUI = false;
        },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        (error) => {
          this.messageNotificationService.showError(
            'Tên đăng nhập hoặc mật khẩu lỗi.'
          );
          this.blockedUI = false;
        }
      )
      .add(() => {
        this.cdr.markForCheck(); // Đánh giấu sự thay đổi
      });
  }
}
