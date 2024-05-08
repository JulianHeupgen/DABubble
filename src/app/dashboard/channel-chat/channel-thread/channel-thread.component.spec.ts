import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChannelThreadComponent } from './channel-thread.component';

describe('ChannelThreadComponent', () => {
  let component: ChannelThreadComponent;
  let fixture: ComponentFixture<ChannelThreadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChannelThreadComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ChannelThreadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
