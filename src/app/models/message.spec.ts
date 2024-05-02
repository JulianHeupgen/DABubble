import { Message } from './message.class';
import { User } from './user.class';

const sender = new User('Max Mustermann', 'max@example.com', 'online');

describe('Message', () => {
  it('should create an instance', () => {
    expect(new Message(sender, 'Hello World')).toBeTruthy();
  });
});

