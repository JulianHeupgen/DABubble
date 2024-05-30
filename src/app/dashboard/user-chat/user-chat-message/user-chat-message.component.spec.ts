import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserChatMessageComponent } from './user-chat-message.component';

describe('UserChatMessageComponent', () => {
  let component: UserChatMessageComponent;
  let fixture: ComponentFixture<UserChatMessageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserChatMessageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UserChatMessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
