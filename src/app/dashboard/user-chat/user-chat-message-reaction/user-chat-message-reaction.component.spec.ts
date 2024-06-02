import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserChatMessageReactionComponent } from './user-chat-message-reaction.component';

describe('UserChatMessageReactionComponent', () => {
  let component: UserChatMessageReactionComponent;
  let fixture: ComponentFixture<UserChatMessageReactionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserChatMessageReactionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UserChatMessageReactionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
