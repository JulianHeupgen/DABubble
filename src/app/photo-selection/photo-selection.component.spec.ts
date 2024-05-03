import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PhotoSelectionComponent } from './photo-selection.component';

describe('PhotoSelectionComponent', () => {
  let component: PhotoSelectionComponent;
  let fixture: ComponentFixture<PhotoSelectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PhotoSelectionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PhotoSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
