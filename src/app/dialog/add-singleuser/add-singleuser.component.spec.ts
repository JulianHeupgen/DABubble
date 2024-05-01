import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddSingleuserComponent } from './add-singleuser.component';

describe('AddSingleuserComponent', () => {
  let component: AddSingleuserComponent;
  let fixture: ComponentFixture<AddSingleuserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddSingleuserComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddSingleuserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
