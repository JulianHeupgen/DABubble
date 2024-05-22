import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FullThreadMessageComponent } from './full-thread-message.component';

describe('FullThreadMessageComponent', () => {
  let component: FullThreadMessageComponent;
  let fixture: ComponentFixture<FullThreadMessageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FullThreadMessageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FullThreadMessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
