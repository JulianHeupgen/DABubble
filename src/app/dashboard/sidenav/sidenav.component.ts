import { animate, state, style, transition, trigger } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule, MatDrawer, MatDrawerContainer, MatDrawerContent } from '@angular/material/sidenav';

@Component({
  selector: 'app-sidenav',
  standalone: true,
  imports: [
    MatSidenavModule,
    CommonModule,
    MatButtonModule,
    MatDrawer,
    MatDrawerContainer,
    MatDrawerContent

  ],
  templateUrl: './sidenav.component.html',
  styleUrl: './sidenav.component.scss',
  animations: [
    trigger('fadeInOut', [
      state('void', style({
        opacity: 0,
        transform: 'translateX(-100%)'
      })),
      state('*', style({
        opacity: 1,
        transform: 'translateX(0)'
      })),
      transition(':enter', [animate('300ms ease-in')]),
      transition(':leave', [animate('300ms ease-out')])
    ])
  ]
})
export class SidenavComponent {
  opened = true;
  imageSrc = './assets/img/sidemenu_close_normal.png';

  toggleSidenav() {
    this.opened = !this.opened;
  }

  hoverMenuButton() {
    if (this.opened) {
      this.imageSrc = './assets/img/sidemenu_close_hover.png';
    } else {
      this.imageSrc = './assets/img/sidemenu_open_hover.png';
    }
  }

  resetHover() {
    if (!this.opened) {
      this.imageSrc = './assets/img/sidemenu_open_normal.png';
    } else {
      this.imageSrc = './assets/img/sidemenu_close_normal.png';
    }
  }

}
