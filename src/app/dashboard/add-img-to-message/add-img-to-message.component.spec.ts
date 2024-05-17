import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddImgToMessageComponent } from './add-img-to-message.component';

describe('AddImgToMessageComponent', () => {
  let component: AddImgToMessageComponent;
  let fixture: ComponentFixture<AddImgToMessageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddImgToMessageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddImgToMessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
