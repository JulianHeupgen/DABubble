import {CommonModule} from '@angular/common';
import {Component, HostListener} from '@angular/core';
import {
  trigger,
  state,
  style,
  animate,
  transition
} from '@angular/animations';
import {Router} from '@angular/router';

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
      state('void', style({opacity: 0})),
      transition('void => *', [
        animate(2000)
      ])
    ]),

    //trigger for the text slidein
    trigger('slideIn', [
      state('void',
        style({marginLeft: '{{marginLeft}}'}),
        {params: {marginLeft: '-470px'}}),
      transition('void => *', [
        animate(400, style({marginLeft: '0'}))
      ])
    ]),

    trigger('grow', [
      state('void',
        style({width: '0px'})),
      state('*',
        style(
          {width: '{{textLogoWidth}}'}),
        {params: {textLogoWidth: '470px'}}),
      transition('void => *', [animate(400)])
    ]),

    trigger('resizeAndMove', [
      state('start',
        style(
          {top: '50%', left: '50%', transform: 'translate(-50%, -50%) scale(1)'})),
      state('end',
        style({
          top: '32px', left: '32px',
          transform: 'scale({{scaleFactor}})',
          transformOrigin: 'top left'
        }),
        {params: {scaleFactor: '.3'}}),
      transition('* => end', animate('1s ease-in-out'))
    ])

  ]
})

export class LogoComponent {

  startGrowing = false;
  containerState = 'start';
  textVisible = false;
  defaultBackground = false;
  textLogoWidth: string = '470px'; // Default value
  iconLogoWidth: string = '187px'; // Default value
  marginLeft: string = '-470px';
  scaleFactor: string = '.3'; // Default scale factor

  constructor(private route: Router) {
  }

  ngOnInit(): void {
    this.calculateDynamicValues();
    setTimeout(() => {
      //change to true when animating
      this.startGrowing = true;
    }, 800);
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    this.calculateDynamicValues();
  }

  calculateDynamicValues() {
    const totalWindowWidth = window.innerWidth;
    const ratio = 2.513; //ratio of the logo elements

    if (totalWindowWidth > 1200) {
      this.textLogoWidth = `470px`;
      this.iconLogoWidth = `187px`;
      this.marginLeft = `-470px`;
      this.scaleFactor = '.3';
      return;
    }

    let adjustedWidth: number;
    if (totalWindowWidth > 800) {
      adjustedWidth = totalWindowWidth * 0.8;
      this.scaleFactor = '.5';
    } else {
      adjustedWidth = totalWindowWidth * 0.6;
      this.scaleFactor = '.5';
    }

    const adjustedIconWidth = adjustedWidth / (1 + ratio);
    const adjustedTextWidth = adjustedIconWidth * ratio;

    this.textLogoWidth = `${adjustedTextWidth}px`;
    this.iconLogoWidth = `${adjustedIconWidth}px`;
    this.marginLeft = `-${adjustedTextWidth}px`;


  }

  growDone() {
    setTimeout(() => {
      this.textVisible = true;
    }, 600);
  }

  slideDone() {
    this.containerState = 'end';
  }

  async resizeAndMoveDone() {
    if (this.containerState === 'end') {
      return;
      this.defaultBackground = true;
      await this.route.navigateByUrl('dashboard');
    }
  }

}
