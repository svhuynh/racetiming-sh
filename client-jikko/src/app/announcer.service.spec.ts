import { TestBed, inject } from '@angular/core/testing';

import { BibsService } from './bibs.service';

describe('BibsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [BibsService]
    });
  });

  it('should be created', inject([BibsService], (service: BibsService) => {
    expect(service).toBeTruthy();
  }));
});
