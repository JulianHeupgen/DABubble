import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserChatThreadComponent } from './user-chat-thread.component';

describe('UserChatThreadComponent', () => {
  let component: UserChatThreadComponent;
  let fixture: ComponentFixture<UserChatThreadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserChatThreadComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UserChatThreadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
