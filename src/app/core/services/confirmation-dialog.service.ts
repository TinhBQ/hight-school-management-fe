import { Injectable } from '@angular/core';

import { ConfirmationService } from 'primeng/api';

@Injectable({
  providedIn: 'root',
})
export class ConfirmationDialogService {
  constructor(private confirmationService: ConfirmationService) {}

  confirm(
    event: Event,
    acceptCallback: () => void,
    rejectCallback?: () => void,
    message?: string
  ): void {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: message ?? 'Bạn có chắc muốn tiếp tục?',
      header: 'Xác nhận',
      icon: 'pi pi-exclamation-triangle',
      acceptIcon: 'pi pi-check',
      rejectIcon: 'pi pi-times',
      rejectButtonStyleClass: 'p-button-text gap-1',
      acceptButtonStyleClass: 'gap-1',
      acceptLabel: 'Có',
      rejectLabel: 'Không',
      accept: () => {
        acceptCallback();
      },
      reject: () => {
        if (rejectCallback) {
          rejectCallback();
        }
      },
    });
  }
}
