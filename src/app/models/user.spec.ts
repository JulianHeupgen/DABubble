import { User } from './user.class';

describe('User', () => {
  it('should create an instance', () => {
    expect(new User('Max Mustermann', 'max@example.com', 'online')).toBeTruthy();
  });
});

