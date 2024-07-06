import { BreadcrumbService } from '@layouts/main/breadcrumb.service';
import { TimetableCreateComponent } from '@features/timetables/components/timetable-create/timetable-create.component';

import { Component } from '@angular/core';

import { paths } from 'src/app/routes/paths';

import { CoreModule } from '@core/core.module';

@Component({
  selector: 'app-timetable-create-page',
  standalone: true,
  imports: [CoreModule, TimetableCreateComponent],
  templateUrl: './timetable-create-page.component.html',
})
export class TimetableCreatePageComponent {
  constructor(private breadcrumbService: BreadcrumbService) {
    this.breadcrumbService.setItems([
      { label: 'SMSEdu' },
      { label: 'Thời khóa biểu', routerLink: paths.smsedu.timetable.root },
      { label: 'Tạo', routerLink: paths.smsedu.timetable.create },
    ]);
  }
}
