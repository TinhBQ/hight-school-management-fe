import { LoginComponent } from '@features/auth/components/login/login.component';

import { Component } from '@angular/core';

import { CoreModule } from '@core/core.module';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CoreModule, LoginComponent],
  templateUrl: './login-page.component.html',
})
export class LoginPageComponent {}
