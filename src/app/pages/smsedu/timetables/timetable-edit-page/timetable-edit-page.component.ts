import { TimetableEditComponent } from '@features/timetables/components/timetable-edit/timetable-edit.component';

import { Component } from '@angular/core';

import { CoreModule } from '@core/core.module';

@Component({
  selector: 'app-timetable-edit-page',
  standalone: true,
  imports: [CoreModule, TimetableEditComponent],
  templateUrl: './timetable-edit-page.component.html',
})
export class TimetableEditPageComponent {}
