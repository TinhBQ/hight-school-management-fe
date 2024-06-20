import { ErrorComponent } from '@features/errors/components/error/error.component';

import { Component } from '@angular/core';

import { CoreModule } from '@core/core.module';

@Component({
  selector: 'app-error-page',
  standalone: true,
  imports: [CoreModule, ErrorComponent],
  templateUrl: './error-page.component.html',
})
export class ErrorPageComponent {}
