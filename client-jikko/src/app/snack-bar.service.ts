import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material';
import { SnackBarComponent } from './snack-bar/snack-bar.component'

export enum MessageType {
  Success = 1,
  Warning = 2,
  Error = 3
}

@Injectable()
export class SnackBarService {

  constructor(public snackBar: MatSnackBar) { }

  /**
   * Shows a snack bar message with an icon
   *
   * @param {string} message  The message to show
   * @param {MessageType} type  The type of icon to show
   */
  public open(message: string, type: MessageType): void {
    this.snackBar.openFromComponent(SnackBarComponent, {
      data: {
        message: message,
        type: type
      },
      duration: 4000
    });
  }
}
