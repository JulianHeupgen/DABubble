import {Component} from '@angular/core';
import {MatButton} from "@angular/material/button";
import {MatCard, MatCardContent} from "@angular/material/card";
import {NgForOf, NgIf} from "@angular/common";
import {RouterLink} from "@angular/router";
import {PhotoSelectionComponent} from "../photo-selection/photo-selection.component";

@Component({
  selector: 'app-register-next',
  standalone: true,
  imports: [
    MatButton,
    MatCard,
    MatCardContent,
    NgForOf,
    NgIf,
    RouterLink,
    PhotoSelectionComponent
  ],
  templateUrl: './register-next.component.html',
  styleUrl: './register-next.component.scss'
})
export class RegisterNextComponent {

}
