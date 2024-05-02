import { Channel } from './channel.class';

describe('Channel', () => {
  it('should create an instance', () => {
    expect(new Channel('TestChannel')).toBeTruthy();
  });
});
