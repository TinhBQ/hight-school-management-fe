import { Component } from '@angular/core';

import { SplitterModule } from 'primeng/splitter';

import { CoreModule } from '@core/core.module';

import { ClassWithHomeroomTeachersAssignedComponent } from '../class-with-homeroom-teachers-assigned/class-with-homeroom-teachers-assigned.component';
import { ClassWithHomeroomTeachersUnassignedComponent } from '../class-with-homeroom-teachers-unassigned/class-with-homeroom-teachers-unassigned.component';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'smsedu-class-with-homeroom-teachers',
  standalone: true,
  imports: [
    CoreModule,
    SplitterModule,
    ClassWithHomeroomTeachersUnassignedComponent,
    ClassWithHomeroomTeachersAssignedComponent,
  ],
  templateUrl: './class-with-homeroom-teachers.component.html',
})
export class ClassWithHomeroomTeachersComponent {}
