import { Component } from '@angular/core';

import { CoreModule } from '@core/core.module';

@Component({
  selector: 'app-timetable-edit-check-and-save',
  standalone: true,
  imports: [CoreModule],
  templateUrl: './timetable-edit-check-and-save.component.html',
})
export class TimetableEditCheckAndSaveComponent {}
