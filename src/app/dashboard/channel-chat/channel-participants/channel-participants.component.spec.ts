import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChannelParticipantsComponent } from './channel-participants.component';

describe('ChannelParticipantsComponent', () => {
  let component: ChannelParticipantsComponent;
  let fixture: ComponentFixture<ChannelParticipantsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChannelParticipantsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ChannelParticipantsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
