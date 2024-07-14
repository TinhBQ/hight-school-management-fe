import { jwtDecode } from 'jwt-decode';

import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { OnInit, Component } from '@angular/core';

import { ButtonModule } from 'primeng/button';

import { paths } from 'src/app/routes/paths';

import { IJwtToken } from '@core/interfaces';
import { ConfirmationDialogService } from '@core/services/confirmation-dialog.service';

import { LayoutMainComponent } from '../layout-main.component';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'layout-main-top-bar',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  templateUrl: './top-bar.component.html',
  providers: [ConfirmationDialogService],
})
export class TopBarComponent implements OnInit {
  activeItem: number;

  decodedToken: IJwtToken;

  constructor(
    public appMain: LayoutMainComponent,
    private confirmationDialogService: ConfirmationDialogService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.decodedToken = jwtDecode(localStorage.getItem('accessToken'));
  }

  mobileMegaMenuItemClick(index: number): void {
    this.activeItem = this.activeItem === index ? null : index;
  }

  onConfirmLogout() {
    this.confirmationDialogService.confirm(event, () => {
      localStorage.clear();
      this.router.navigate([paths.auth.login]);
    });
  }
}
