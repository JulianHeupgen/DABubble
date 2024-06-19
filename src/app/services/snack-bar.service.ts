import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class SnackBarService {

  constructor(private _snackbar: MatSnackBar) { }

  /**
   * Displays a snack bar with the specified message and action.
   * @param message - The message to display in the snack bar.
   * @param action - The label for the snack bar action. Optional.
   * @param seconds - The duration to display the snack bar, in seconds. Default is 3 seconds.
   */
  showSnackBar(message: string, action: string | undefined = undefined, seconds: number = 3) {
    this._snackbar.open(message, action, {
      duration: seconds * 1000
    });
  }
}
