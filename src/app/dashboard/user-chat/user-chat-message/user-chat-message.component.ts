import { Component, Input } from '@angular/core';
import { Message } from '../../../models/message.class';

@Component({
  selector: 'app-user-chat-message',
  standalone: true,
  imports: [],
  templateUrl: './user-chat-message.component.html',
  styleUrl: './user-chat-message.component.scss'
})
export class UserChatMessageComponent {

  @Input() message!: Message;

}
