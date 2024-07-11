import { AssignmentsTeachingComponent } from '@features/assignments/components/assignments-teaching/assignments-teaching.component';

import { Component } from '@angular/core';

import { CoreModule } from '@core/core.module';

@Component({
  selector: 'app-assign-teaching-page',
  standalone: true,
  imports: [CoreModule, AssignmentsTeachingComponent],
  templateUrl: './assign-teaching-page.component.html',
})
export class AssignTeachingPageComponent {}
