import { BreadcrumbService } from '@layouts/main/breadcrumb.service';
import { ClassWithHomeroomTeachersComponent } from '@features/class-with-homeroom-teachers/components/class-with-homeroom-teachers/class-with-homeroom-teachers.component';

import { Component } from '@angular/core';

import { paths } from 'src/app/routes/paths';

import { CoreModule } from '@core/core.module';

@Component({
  selector: 'app-assign-homeroom-teacher-page',
  standalone: true,
  imports: [CoreModule, ClassWithHomeroomTeachersComponent],
  templateUrl: './assign-homeroom-teacher-page.component.html',
})
export class AssignHomeroomTeacherPageComponent {
  constructor(private breadcrumbService: BreadcrumbService) {
    this.breadcrumbService.setItems([
      { label: 'SMSEdu' },
      { label: 'Phân công', routerLink: paths.smsedu.assignment.root },
      {
        label: 'Phân công giảng dạy',
        routerLink: paths.smsedu.assignment.teacherLeader,
      },
    ]);
  }
}
