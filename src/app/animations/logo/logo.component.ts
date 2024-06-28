import { CommonModule } from '@angular/common';
import { Component, HostListener } from '@angular/core';
import {
  trigger,
  state,
  style,
  animate,
  transition
} from '@angular/animations';
import { Router } from '@angular/router';

@Component({
  selector: 'app-logo',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './logo.component.html',
  styleUrls: ['./logo.component.scss'],
  animations: [
    // trigger for the icon
    trigger('fade', [
      state('void', style({ opacity: 0 })),
      transition('void => *', [
        animate(2000)
      ])
    ]),

    // trigger for the text slide-in
    trigger('slideIn', [
      state('void', style({ marginLeft: '{{marginLeft}}' }), { params: { marginLeft: '-470px' } }),
      transition('void => *', [
        animate(400, style({ marginLeft: '0' }))
      ])
    ]),

    trigger('grow', [
      state('void', style({ width: '0px' })),
      state('*', style({ width: '{{textLogoWidth}}' }), { params: { textLogoWidth: '470px' } }),
      transition('void => *', [animate(400)])
    ]),

    trigger('resizeAndMove', [
      state('start', style({ top: '50%', left: '50%', transform: 'translate(-50%, -50%) scale(1)' })),
      state('end', style({
        top: '32px', left: '32px',
        transform: 'scale({{scaleFactor}})',
        transformOrigin: 'top left'
      }), { params: { scaleFactor: '.3' } }),
      transition('* => end', animate('1s ease-in-out'))
    ])
  ]
})
export class LogoComponent {

  logoTextUrl: string = 'assets/img/logo-text-white.png';
  fullLogoBlackUrl: string = 'assets/img/dabubble_header_logo.png';

  startGrowing = false;
  containerState = 'start';
  textVisible = false;
  defaultBackground = false;
  textLogoWidth: string = '470px'; // Default value
  iconLogoWidth: string = '187px'; // Default value
  marginLeft: string = '-470px';
  scaleFactor: string = '.354'; // Default scale factor

  constructor(private route: Router) { }

  ngOnInit(): void {
    this.calculateDynamicValues();
    setTimeout(() => {
      // Change to true when animating
      this.startGrowing = true;
    }, 800);
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    this.calculateDynamicValues();
  }

  /**
   * Calculates dynamic values for logo dimensions based on the window width.
   */
  calculateDynamicValues() {
    const totalWindowWidth = window.innerWidth;
    const ratio = 2.513; // Ratio of the logo elements

    if (totalWindowWidth > 1200) {
      this.textLogoWidth = `470px`;
      this.iconLogoWidth = `187px`;
      this.marginLeft = `-470px`;
      this.scaleFactor = '.354';
      return;
    }

    let adjustedWidth: number;
    if (totalWindowWidth > 800) {
      adjustedWidth = totalWindowWidth * 0.5;
      this.scaleFactor = '.6';
    } else {
      adjustedWidth = totalWindowWidth * 0.6;
      this.scaleFactor = '.4';
    }

    const adjustedIconWidth = adjustedWidth / (1 + ratio);
    const adjustedTextWidth = adjustedIconWidth * ratio;

    this.textLogoWidth = `${adjustedTextWidth}px`;
    this.iconLogoWidth = `${adjustedIconWidth}px`;
    this.marginLeft = `-${adjustedTextWidth}px`;
  }

  /**
   * Handler for the completion of the grow animation.
   */
  growDone() {
    setTimeout(() => {
      this.textVisible = true;
    }, 600);
  }

  /**
   * Handler for the completion of the slide animation.
   */
  slideDone() {
    this.containerState = 'end';
  }

  /**
   * Handler for the completion of the resize and move animation.
   * Navigates to the dashboard and updates the logo text URL.
   */
  async resizeAndMoveDone() {
    if (this.containerState === 'end') {
      this.defaultBackground = true;
      this.logoTextUrl = 'assets/img/logo-text-black.png';
      await this.route.navigateByUrl('dashboard');
    }
  }
}
