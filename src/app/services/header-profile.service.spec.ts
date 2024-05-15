import { TestBed } from '@angular/core/testing';

import { HeaderProfileService } from './header-profile.service';

describe('HeaderProfileService', () => {
  let service: HeaderProfileService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HeaderProfileService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
