import { SubjectClassListComponent } from '@features/subject-class/components/subject-class-list/subject-class-list.component';
import { SubjectsTeachersListComponent } from '@features/subjects-teachers/components/subjects-teachers-list/subjects-teachers-list.component';

import { OnInit, Component } from '@angular/core';

import { MenuItem } from 'primeng/api';
import { TabMenuModule } from 'primeng/tabmenu';

import { CoreModule } from '@core/core.module';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'smsedu-subject-assignment',
  standalone: true,
  imports: [
    CoreModule,
    TabMenuModule,
    SubjectClassListComponent,
    SubjectsTeachersListComponent,
  ],
  templateUrl: './subject-assignment.component.html',
})
export class SubjectAssignmentComponent implements OnInit {
  items: MenuItem[] | undefined;

  activeItem: MenuItem | undefined;

  ngOnInit() {
    this.items = [
      { label: 'Giáo viên', icon: 'pi pi-home' },
      { label: 'Lớp học', icon: 'pi pi-chart-line' },
    ];

    this.activeItem = this.items[0];
  }

  onActiveItemChange(event: MenuItem) {
    this.activeItem = event;
  }
}
