import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReAuthenticateUserComponent } from './re-authenticate-user.component';

describe('ReAuthenticateUserComponent', () => {
  let component: ReAuthenticateUserComponent;
  let fixture: ComponentFixture<ReAuthenticateUserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReAuthenticateUserComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ReAuthenticateUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
