import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class SnackBarService {

  constructor(private _snackbar: MatSnackBar) { }

  showSnackBar(message: string, action: string, seconds: number = 3, ) {
    this._snackbar.open(message, action, {
      duration: seconds*1000
    });
  }
}
