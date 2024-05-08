import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FullThreadComponent } from './full-thread.component';

describe('FullThreadComponent', () => {
  let component: FullThreadComponent;
  let fixture: ComponentFixture<FullThreadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FullThreadComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FullThreadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
