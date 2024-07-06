import { BreadcrumbService } from '@layouts/main/breadcrumb.service';
import { SubjectAssignmentComponent } from '@features/subjects/components/subject-assignment/subject-assignment.component';

import { Component } from '@angular/core';

import { paths } from 'src/app/routes/paths';

import { CoreModule } from '@core/core.module';

@Component({
  selector: 'app-assign-subject-page',
  standalone: true,
  imports: [CoreModule, SubjectAssignmentComponent],
  templateUrl: './assign-subject-page.component.html',
})
export class AssignSubjectPageComponent {
  constructor(private breadcrumbService: BreadcrumbService) {
    this.breadcrumbService.setItems([
      { label: 'SMSEdu' },
      { label: 'Phân công', routerLink: paths.smsedu.assignment.root },
      { label: 'Môn học', routerLink: paths.smsedu.assignment.subject },
    ]);
  }
}
