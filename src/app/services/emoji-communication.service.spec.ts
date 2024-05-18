import { TestBed } from '@angular/core/testing';

import { EmojiCommunicationService } from './emoji-communication.service';

describe('EmojiCommunicationService', () => {
  let service: EmojiCommunicationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EmojiCommunicationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
