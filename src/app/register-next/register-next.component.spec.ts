import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterNextComponent } from './register-next.component';

describe('RegisterNextComponent', () => {
  let component: RegisterNextComponent;
  let fixture: ComponentFixture<RegisterNextComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterNextComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RegisterNextComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
