import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SendMailToResetPasswordComponent } from './send-mail-to-reset-password.component';

describe('SendMailToResetPasswordComponent', () => {
  let component: SendMailToResetPasswordComponent;
  let fixture: ComponentFixture<SendMailToResetPasswordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SendMailToResetPasswordComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SendMailToResetPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
