import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
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

    //trigger for the text slidein
    trigger('slideIn', [
      state('void', style({ marginLeft: '-470px' })),
      transition('void => *', [
        animate(400, style({ marginLeft: '0' }))
      ])

    ]),

    trigger('grow', [
      state('void', style({ width: '0px' })),
      transition('void => *', [
        animate(400, style({ width: '470px' }))
      ])
    ]),

    trigger('resizeAndMove', [
      state('start', style({ top: '50%', left: '50%', transform: 'translate(-50%, -50%) scale(1)' })),
      state('end', style({ top: '32px', left: '32px', transform: 'scale(.3)', transformOrigin: 'top left' })),
      transition('* => end', animate('1s ease-in-out'))
    ])

  ]
})

export class LogoComponent {

  startGrowing = false;
  containerState = 'start';
  iconVisible = true;
  textVisible = false;
  logoVisible = false;
  defaultBackground = false;

  constructor(private route: Router){}

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    setTimeout(() => {
      //change to true when animating
      this.startGrowing = true;
    }, 800);
  }

  growDone() {
    setTimeout(() => {
      this.textVisible = true;
    }, 600);
  }

  slideDone() {
    this.containerState = 'end';
  }

  resizeAndMoveDone() {
    if (this.containerState === 'end'){
      this.defaultBackground = true;
      this.route.navigateByUrl('login');
    }
  }

}
